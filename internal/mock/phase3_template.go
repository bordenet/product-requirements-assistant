package main

// Phase 3 template for final synthesized PRD
const phase3Template = `# Final Product Requirements Document: %s

**Generated**: %s  
**AI Model**: Claude Sonnet 4.5 (Mock)  
**Phase**: Final Synthesis

## Document Purpose

This final PRD synthesizes the initial requirements with critical review feedback to produce a comprehensive, actionable specification for %s.

## Changes from Initial PRD

### Incorporated Feedback ✅

#### 1. Enhanced User Research
- **Added**: User interview protocol (Appendix A)
- **Added**: Persona definitions for 3 primary user types
- **Added**: User journey maps for core workflows

#### 2. Comprehensive Error Handling
- **Added**: Error taxonomy with 15 error categories
- **Added**: User-facing error messages for each scenario
- **Added**: Retry logic and fallback mechanisms
- **Added**: Error logging and monitoring specifications

#### 3. Detailed Accessibility Requirements
- **Added**: WCAG 2.1 AA compliance checklist
- **Added**: Keyboard navigation map
- **Added**: Screen reader testing protocol
- **Added**: Color palette with contrast ratios

#### 4. Data Privacy Implementation
- **Added**: GDPR compliance matrix
- **Added**: User consent flow diagrams
- **Added**: Data retention schedule (7 years)
- **Added**: Right to deletion API endpoint specification

#### 5. Performance Baselines
- **Added**: Current system performance metrics
- **Added**: Competitive benchmark analysis
- **Added**: Performance improvement targets with justification

### Refined Feature Prioritization

#### Must Have (MVP - Month 3)
1. User authentication and authorization
2. Core workflow implementation
3. Basic error handling
4. Mobile-responsive UI
5. Essential API endpoints

#### Should Have (v1.0 - Month 6)
1. Enhanced user experience features
2. Advanced error recovery
3. Comprehensive accessibility
4. Performance optimizations
5. Basic analytics

#### Could Have (v1.1 - Month 9)
1. Advanced analytics dashboard
2. Custom reporting
3. Third-party integrations
4. Offline support (PWA)
5. Advanced personalization

#### Won't Have (Future Consideration)
1. AI-powered recommendations
2. Multi-language support
3. White-label capabilities
4. Enterprise SSO integration

## Technical Architecture (Refined)

### System Components

#### Frontend Layer
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit
- **UI Library**: Material-UI v5
- **Build Tool**: Vite
- **Testing**: Jest + React Testing Library

#### Backend Layer
- **API Framework**: Go 1.21+ with Gorilla Mux
- **Authentication**: JWT with refresh tokens
- **Rate Limiting**: Token bucket algorithm (100 req/min per user)
- **Caching**: Redis for session and data caching
- **Queue**: RabbitMQ for async processing

#### Data Layer
- **Primary Database**: PostgreSQL 15 (relational data)
- **Cache**: Redis 7 (session, frequently accessed data)
- **Object Storage**: AWS S3 (file uploads, backups)
- **Search**: Elasticsearch 8 (full-text search)

#### Infrastructure
- **Cloud Provider**: AWS
- **Compute**: ECS Fargate (containerized services)
- **CDN**: CloudFront (static assets)
- **Monitoring**: CloudWatch + Datadog
- **CI/CD**: GitHub Actions

### API Versioning Strategy
- **Approach**: URI versioning (/api/v1/, /api/v2/)
- **Deprecation Policy**: 6-month notice, 12-month support
- **Documentation**: OpenAPI 3.0 specification

### Security Architecture

#### Authentication Flow
1. User submits credentials
2. Server validates against database
3. Server generates JWT (15-min expiry) + refresh token (7-day expiry)
4. Client stores tokens securely (httpOnly cookies)
5. Client includes JWT in Authorization header
6. Server validates JWT on each request

#### Authorization Model
- **Model**: Role-Based Access Control (RBAC)
- **Roles**: Admin, Manager, User, Guest
- **Permissions**: 25 granular permissions
- **Implementation**: Middleware-based permission checks

#### Data Protection
- **At Rest**: AES-256 encryption for sensitive fields
- **In Transit**: TLS 1.3 for all connections
- **Secrets Management**: AWS Secrets Manager
- **Key Rotation**: Quarterly automatic rotation

## Testing Strategy (Comprehensive)

### Test Coverage Requirements
- **Unit Tests**: 85%% minimum coverage
- **Integration Tests**: All API endpoints + database operations
- **E2E Tests**: 10 critical user journeys
- **Performance Tests**: Weekly load tests (2x expected traffic)
- **Security Tests**: Monthly OWASP Top 10 scans

### Test Environments
1. **Local**: Developer machines
2. **Development**: Shared dev environment
3. **Staging**: Production-like environment
4. **Production**: Live system

### Continuous Testing
- **Pre-commit**: Unit tests + linting
- **PR**: Full test suite + code review
- **Merge to main**: Integration + E2E tests
- **Deploy to staging**: Performance + security tests
- **Deploy to production**: Smoke tests + monitoring

---

**Document Status**: Final  
**Version**: 3.0  
**Last Updated**: %s  
**Next Review**: 3 months post-launch

*This is a comprehensive mock AI-generated PRD for testing purposes.*
`
