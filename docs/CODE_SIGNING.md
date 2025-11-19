# Code Signing for Windows Executables

## Current Status

⚠️ **Our executables are NOT code-signed**, which means:

- Windows Defender SmartScreen will show warnings
- Users must click "More info" → "Run anyway"
- Corporate environments may block unsigned executables entirely
- No reputation with Microsoft SmartScreen

## The Problem

When users download our executables:

### Electron Installer (.exe)
```
Windows protected your PC
Microsoft Defender SmartScreen prevented an unrecognized app from starting.
Running this app might put your PC at risk.

[Don't run]  [More info]
```

### WebView2 Portable (.exe)
Same warning, plus potential blocks from:
- Corporate antivirus
- Group Policy restrictions
- Windows Defender Application Control (WDAC)

## Solutions

### Option 1: Code Signing Certificate (Recommended)

**Cost**: $300-500/year  
**Setup Time**: 1-2 weeks  
**Effectiveness**: ✅ Eliminates warnings immediately

#### Steps:

1. **Purchase a code signing certificate**
   - **DigiCert**: $474/year (EV certificate, best reputation)
   - **Sectigo**: $299/year (OV certificate, good reputation)
   - **SSL.com**: $249/year (OV certificate)

2. **Get an EV (Extended Validation) certificate if possible**
   - Requires business verification
   - Builds SmartScreen reputation faster
   - No warnings after ~100 downloads

3. **Store certificate securely**
   - Use GitHub Secrets for CI/CD
   - Never commit certificate files to repo

4. **Configure electron-builder** (see below)

5. **Sign WebView2 binaries** with `signtool.exe`

### Option 2: Build Reputation Over Time (Free but Slow)

**Cost**: $0  
**Setup Time**: Immediate  
**Effectiveness**: ⚠️ Takes 3-6 months, requires thousands of downloads

- Keep distributing unsigned binaries
- After ~1000-10000 downloads, SmartScreen learns the file is safe
- Warnings gradually decrease
- **Problem**: Different for each version (hash-based)

### Option 3: Notarization Workaround (Partial Solution)

**Cost**: $0  
**Setup Time**: 1 day  
**Effectiveness**: ⚠️ Only helps with some antivirus, not SmartScreen

- Submit binaries to Microsoft for malware scanning
- Doesn't eliminate SmartScreen warnings
- Helps with some corporate antivirus

## Recommended Approach

### Short Term (Now)

1. **Update documentation** to explain the warning is normal
2. **Add screenshots** showing how to bypass SmartScreen
3. **Provide SHA256 checksums** so users can verify downloads
4. **Consider VirusTotal** links for each release

### Long Term (Next Release)

1. **Purchase EV code signing certificate** ($474/year from DigiCert)
2. **Configure automated signing** in GitHub Actions
3. **Sign both Electron and WebView2** executables
4. **Build SmartScreen reputation** (takes 2-4 weeks with EV cert)

## Implementation

### 1. Configure Electron Code Signing

Update `cmd/electron/package.json`:

```json
{
  "build": {
    "win": {
      "target": ["nsis"],
      "icon": "../../build/electron/icons/icon.ico",
      "certificateFile": "path/to/cert.pfx",
      "certificatePassword": "${env.WINDOWS_CERT_PASSWORD}",
      "signingHashAlgorithms": ["sha256"],
      "rfc3161TimeStampServer": "http://timestamp.digicert.com"
    }
  }
}
```

### 2. Configure GitHub Actions

Add to `.github/workflows/release.yml`:

```yaml
- name: Build Electron app
  env:
    WINDOWS_CERT_PASSWORD: ${{ secrets.WINDOWS_CERT_PASSWORD }}
    WINDOWS_CERT_BASE64: ${{ secrets.WINDOWS_CERT_BASE64 }}
  run: |
    # Decode certificate from base64
    echo "$WINDOWS_CERT_BASE64" | base64 --decode > cert.pfx
    cd cmd/electron
    npm run build:win
    # Clean up certificate
    rm ../../cert.pfx
```

### 3. Sign WebView2 Binaries

Add signing step for Go binaries:

```yaml
- name: Sign WebView2 executable
  if: matrix.os == 'windows-latest'
  env:
    WINDOWS_CERT_PASSWORD: ${{ secrets.WINDOWS_CERT_PASSWORD }}
  run: |
    # Install Windows SDK for signtool
    choco install windows-sdk-10.1 -y
    
    # Sign the executable
    signtool sign /f cert.pfx /p "$env:WINDOWS_CERT_PASSWORD" `
      /tr http://timestamp.digicert.com /td sha256 /fd sha256 `
      dist/webview/prd-assistant-windows-amd64.exe
```

## Cost-Benefit Analysis

| Option | Cost/Year | Setup Time | User Experience | Recommendation |
|--------|-----------|------------|-----------------|----------------|
| **EV Certificate** | $474 | 1-2 weeks | ✅ No warnings | ⭐ Best |
| **OV Certificate** | $299 | 1 week | ⚠️ Warnings for 1-2 months | Good |
| **No Signing** | $0 | 0 | ❌ Always warnings | Current |

## Next Steps

1. **Decide on budget** for code signing certificate
2. **If approved**: Purchase EV certificate from DigiCert
3. **If not approved**: Update docs with better SmartScreen bypass instructions
4. **Either way**: Add SHA256 checksums to releases

## References

- [Electron Code Signing](https://www.electron.build/code-signing)
- [Microsoft SmartScreen](https://docs.microsoft.com/en-us/windows/security/threat-protection/microsoft-defender-smartscreen/microsoft-defender-smartscreen-overview)
- [DigiCert Code Signing](https://www.digicert.com/signing/code-signing-certificates)

