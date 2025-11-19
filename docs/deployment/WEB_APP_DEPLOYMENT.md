# CloudFront Deployment Guide

## Prerequisites

- AWS Account
- AWS CLI configured
- Domain name (optional)

---

## Step 1: Create S3 Bucket

```bash
# Create bucket for static files
aws s3 mb s3://prd-assistant-web --region us-east-1

# Enable static website hosting
aws s3 website s3://prd-assistant-web \
  --index-document index.html \
  --error-document index.html

# Block public access (CloudFront will access via OAI)
aws s3api put-public-access-block \
  --bucket prd-assistant-web \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

---

## Step 2: Create CloudFront Distribution

### 2.1 Create Origin Access Identity (OAI)

```bash
aws cloudfront create-cloud-front-origin-access-identity \
  --cloud-front-origin-access-identity-config \
    CallerReference="prd-assistant-$(date +%s)",Comment="PRD Assistant OAI"
```

Save the OAI ID from the response.

### 2.2 Update S3 Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontOAI",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity YOUR_OAI_ID"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::prd-assistant-web/*"
    }
  ]
}
```

Apply policy:
```bash
aws s3api put-bucket-policy \
  --bucket prd-assistant-web \
  --policy file://bucket-policy.json
```

### 2.3 Create CloudFront Distribution

```bash
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

**cloudfront-config.json:**
```json
{
  "CallerReference": "prd-assistant-2024",
  "Comment": "PRD Assistant Web App",
  "Enabled": true,
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-prd-assistant-web",
        "DomainName": "prd-assistant-web.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": "origin-access-identity/cloudfront/YOUR_OAI_ID"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-prd-assistant-web",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "Compress": true,
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "PriceClass": "PriceClass_100"
}
```

---

## Step 3: Deploy Static Files

### 3.1 Build Web App

```bash
cd web

# Minify JavaScript (optional)
npx terser js/*.js --compress --mangle -o dist/app.min.js

# Minify CSS (optional)
npx csso css/styles.css -o dist/styles.min.css

# Copy HTML and data
cp index.html dist/
cp -r data dist/
```

### 3.2 Upload to S3

```bash
# Upload with cache headers
aws s3 sync dist/ s3://prd-assistant-web/ \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "*.json"

# Upload index.html with short cache
aws s3 cp dist/index.html s3://prd-assistant-web/index.html \
  --cache-control "public, max-age=300"

# Upload JSON data with short cache
aws s3 sync dist/data/ s3://prd-assistant-web/data/ \
  --cache-control "public, max-age=3600"
```

### 3.3 Invalidate CloudFront Cache

```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

---

## Step 4: Custom Domain (Optional)

### 4.1 Request SSL Certificate

```bash
# Must be in us-east-1 for CloudFront
aws acm request-certificate \
  --domain-name prd.yourdomain.com \
  --validation-method DNS \
  --region us-east-1
```

### 4.2 Validate Certificate

Add the CNAME record to your DNS (Route 53 or external).

### 4.3 Update CloudFront Distribution

```bash
aws cloudfront update-distribution \
  --id YOUR_DISTRIBUTION_ID \
  --distribution-config file://cloudfront-config-with-domain.json
```

Add to config:
```json
{
  "Aliases": {
    "Quantity": 1,
    "Items": ["prd.yourdomain.com"]
  },
  "ViewerCertificate": {
    "ACMCertificateArn": "arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT_ID",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  }
}
```

### 4.4 Update DNS

```bash
# Route 53
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_ZONE_ID \
  --change-batch file://dns-change.json
```

**dns-change.json:**
```json
{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "prd.yourdomain.com",
      "Type": "A",
      "AliasTarget": {
        "HostedZoneId": "Z2FDTNDATAQYW2",
        "DNSName": "d1234567890.cloudfront.net",
        "EvaluateTargetHealth": false
      }
    }
  }]
}
```

---

## Step 5: Continuous Deployment

### GitHub Actions Workflow

**.github/workflows/deploy-web.yml:**
```yaml
name: Deploy Web App

on:
  push:
    branches: [main]
    paths:
      - 'web/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build
        run: |
          cd web
          # Add build steps if needed
      
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to S3
        run: |
          aws s3 sync web/ s3://prd-assistant-web/ \
            --delete \
            --cache-control "public, max-age=31536000"
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

---

## Cost Estimate

| Service | Usage | Cost/Month |
|---------|-------|------------|
| **S3 Storage** | 100MB | $0.02 |
| **S3 Requests** | 10,000 GET | $0.004 |
| **CloudFront** | 10GB transfer | $0.85 |
| **CloudFront Requests** | 100,000 | $0.10 |
| **Route 53** | 1 hosted zone | $0.50 |
| **Total** | | **~$1.50/month** |

With moderate traffic (1000 users/month):
- **~$5-10/month**

---

## Monitoring

### CloudWatch Metrics

```bash
# View CloudFront metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --dimensions Name=DistributionId,Value=YOUR_DISTRIBUTION_ID \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-31T23:59:59Z \
  --period 86400 \
  --statistics Sum
```

---

## Security Headers

Add to CloudFront response headers policy:

```json
{
  "SecurityHeadersConfig": {
    "ContentSecurityPolicy": {
      "ContentSecurityPolicy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
      "Override": true
    },
    "StrictTransportSecurity": {
      "AccessControlMaxAgeSec": 31536000,
      "IncludeSubdomains": true,
      "Override": true
    },
    "XContentTypeOptions": {
      "Override": true
    },
    "XFrameOptions": {
      "FrameOption": "DENY",
      "Override": true
    }
  }
}
```

---

## Done!

Your app is now live at:
- **CloudFront:** `https://d1234567890.cloudfront.net`
- **Custom Domain:** `https://prd.yourdomain.com`

**Total cost:** ~$1.50-10/month  
**Privacy:** 100% client-side, zero data collection

