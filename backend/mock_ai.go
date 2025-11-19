package main

import (
	"fmt"
	"log"
	"time"
)

var mockAI *MockAIGenerator

// InitMockAI initializes the global mock AI generator
func InitMockAI(enabled bool) {
	mockAI = NewMockAIGenerator(enabled)
	if enabled {
		log.Printf("Mock AI enabled - automated response generation available")
	}
}

// GetMockAI returns the global mock AI generator
func GetMockAI() *MockAIGenerator {
	return mockAI
}

// MockAIGenerator generates realistic AI responses for testing
type MockAIGenerator struct {
	enabled bool
}

// NewMockAIGenerator creates a new mock AI generator
func NewMockAIGenerator(enabled bool) *MockAIGenerator {
	return &MockAIGenerator{enabled: enabled}
}

// IsEnabled returns whether mock AI is enabled
func (m *MockAIGenerator) IsEnabled() bool {
	return m.enabled
}

// GeneratePhase1Response generates a mock Claude initial PRD response
func (m *MockAIGenerator) GeneratePhase1Response(title, problems, context string) string {
	timestamp := time.Now().Format("2006-01-02 15:04:05")

	return fmt.Sprintf(`# Product Requirements Document: %s

**Generated**: %s  
**AI Model**: Claude Sonnet 4.5 (Mock)  
**Phase**: Initial PRD Draft

## Executive Summary

This document outlines the product requirements for %s, addressing the following key challenges:

%s

## Problem Statement

### Current Situation
%s

### Target Users
- Primary: End users seeking improved functionality
- Secondary: Development team implementing the solution
- Tertiary: Stakeholders monitoring product success

## Proposed Solution

### Overview
The proposed solution will address the identified problems through a systematic approach that prioritizes user experience, technical feasibility, and business value.

### Key Features

#### Feature 1: Core Functionality
- **Description**: Primary feature addressing the main user need
- **Priority**: P0 (Critical)
- **User Story**: As a user, I want to accomplish my primary goal efficiently
- **Acceptance Criteria**:
  - System responds within 2 seconds
  - 99.9%% uptime
  - Handles 1000 concurrent users

#### Feature 2: Enhanced User Experience
- **Description**: Improved interface and interaction patterns
- **Priority**: P1 (High)
- **User Story**: As a user, I want an intuitive interface
- **Acceptance Criteria**:
  - Mobile-responsive design
  - Accessibility compliance (WCAG 2.1 AA)
  - Cross-browser compatibility

#### Feature 3: Analytics and Monitoring
- **Description**: Track usage and performance metrics
- **Priority**: P2 (Medium)
- **User Story**: As a stakeholder, I want to monitor product performance
- **Acceptance Criteria**:
  - Real-time dashboards
  - Custom report generation
  - Alert system for anomalies

## Technical Requirements

### Architecture
- **Frontend**: Modern web framework (React/Vue/Angular)
- **Backend**: RESTful API with microservices architecture
- **Database**: Scalable NoSQL/SQL hybrid approach
- **Infrastructure**: Cloud-native deployment (AWS/GCP/Azure)

### Performance Requirements
- Page load time: < 2 seconds
- API response time: < 500ms (p95)
- Database query time: < 100ms (p95)
- Concurrent users: 10,000+

### Security Requirements
- Authentication: OAuth 2.0 / JWT
- Authorization: Role-based access control (RBAC)
- Data encryption: At rest and in transit (TLS 1.3)
- Compliance: GDPR, SOC 2, ISO 27001

## User Experience

### User Flows
1. **Onboarding**: Simple 3-step registration process
2. **Core Workflow**: Intuitive task completion path
3. **Advanced Features**: Progressive disclosure of complexity

### Design Principles
- Simplicity: Minimize cognitive load
- Consistency: Unified design language
- Feedback: Clear system status communication
- Error Prevention: Validate inputs proactively

## Success Metrics

### Key Performance Indicators (KPIs)
- User adoption rate: 70%% within 3 months
- Daily active users (DAU): 5,000+
- User satisfaction (NPS): > 50
- Task completion rate: > 90%%

### Business Metrics
- Revenue impact: $500K ARR
- Cost savings: 30%% operational efficiency
- Time to market: 6 months
- ROI: 200%% within 12 months

## Implementation Plan

### Phase 1: Foundation (Months 1-2)
- Core infrastructure setup
- Basic feature implementation
- Internal testing

### Phase 2: Enhancement (Months 3-4)
- Advanced features
- UI/UX refinement
- Beta testing

### Phase 3: Launch (Months 5-6)
- Production deployment
- Marketing campaign
- User onboarding

## Risks and Mitigation

### Technical Risks
- **Risk**: Scalability challenges
- **Mitigation**: Load testing, auto-scaling infrastructure

### Business Risks
- **Risk**: Low user adoption
- **Mitigation**: User research, iterative feedback loops

### Timeline Risks
- **Risk**: Development delays
- **Mitigation**: Agile methodology, buffer time allocation

## Appendix

### Glossary
- **API**: Application Programming Interface
- **KPI**: Key Performance Indicator
- **MVP**: Minimum Viable Product

### References
- User research findings
- Competitive analysis
- Technical feasibility study

---

*This is a mock AI-generated response for testing purposes.*
`, title, timestamp, title, problems, problems)
}

// GeneratePhase2Response generates a mock Gemini review response
func (m *MockAIGenerator) GeneratePhase2Response(title, phase1Content string) string {
	timestamp := time.Now().Format("2006-01-02 15:04:05")

	return fmt.Sprintf(`# PRD Review and Recommendations: %s

**Generated**: %s
**AI Model**: Gemini 2.5 Pro (Mock)
**Phase**: Critical Review

## Overall Assessment

The initial PRD provides a solid foundation for %s. This review identifies strengths, weaknesses, and recommendations for improvement.

### Strengths ✅
1. **Clear Problem Definition**: The problem statement is well-articulated and user-focused
2. **Comprehensive Feature Set**: Core features address primary user needs effectively
3. **Technical Feasibility**: Proposed architecture is sound and scalable
4. **Measurable Success Criteria**: KPIs are specific and achievable

### Areas for Improvement ⚠️

#### 1. User Research Depth
**Issue**: Limited evidence of user validation
**Impact**: Medium
**Recommendation**: Conduct user interviews with 10-15 target users before finalizing requirements

#### 2. Edge Cases and Error Handling
**Issue**: Insufficient coverage of failure scenarios
**Impact**: High
**Recommendation**: Add detailed error handling specifications for:
- Network failures
- Invalid user inputs
- System overload conditions
- Data corruption scenarios

#### 3. Accessibility Considerations
**Issue**: WCAG compliance mentioned but not detailed
**Impact**: Medium
**Recommendation**: Specify:
- Keyboard navigation requirements
- Screen reader compatibility
- Color contrast ratios
- Alternative text for images

#### 4. Data Privacy and Compliance
**Issue**: GDPR mentioned but implementation unclear
**Impact**: High
**Recommendation**: Detail:
- Data retention policies
- User consent mechanisms
- Right to deletion implementation
- Data export functionality

#### 5. Performance Benchmarks
**Issue**: Metrics provided but baseline unclear
**Impact**: Medium
**Recommendation**: Establish current performance baselines and justify targets

## Detailed Recommendations

### Feature Prioritization
**Current**: All features marked P0-P2
**Recommended**: Apply MoSCoW method
- **Must Have**: Core functionality only
- **Should Have**: Enhanced UX features
- **Could Have**: Analytics (move to Phase 2)
- **Won't Have**: Advanced features for v1.0

### Technical Architecture
**Addition Needed**:
- API versioning strategy
- Database migration plan
- Rollback procedures
- Monitoring and alerting specifics

### Security Enhancements
**Critical Additions**:
1. **Input Validation**: Specify validation rules for all user inputs
2. **Rate Limiting**: Define API rate limits per user/IP
3. **Audit Logging**: Track all sensitive operations
4. **Penetration Testing**: Schedule security audit before launch

### User Experience
**Improvements**:
1. **Onboarding**: Add interactive tutorial for first-time users
2. **Help System**: Implement contextual help tooltips
3. **Feedback Mechanisms**: Add in-app feedback collection
4. **Offline Support**: Consider progressive web app (PWA) capabilities

## Risk Assessment Enhancements

### Additional Risks to Consider

#### Operational Risks
- **Risk**: Insufficient support team capacity
- **Mitigation**: Hire 2 support engineers, implement chatbot for common issues

#### Compliance Risks
- **Risk**: Regulatory changes during development
- **Mitigation**: Monthly compliance review, legal consultation

#### Vendor Risks
- **Risk**: Third-party service dependencies
- **Mitigation**: Identify alternatives, implement circuit breakers

## Testing Strategy (Missing from Original)

### Recommended Testing Approach
1. **Unit Tests**: 80%% code coverage minimum
2. **Integration Tests**: All API endpoints
3. **E2E Tests**: Critical user journeys
4. **Performance Tests**: Load testing with 2x expected traffic
5. **Security Tests**: OWASP Top 10 vulnerability scanning
6. **Accessibility Tests**: Automated and manual WCAG validation

## Documentation Requirements (Missing)

### Essential Documentation
1. **API Documentation**: OpenAPI/Swagger specification
2. **User Guide**: Step-by-step tutorials
3. **Admin Guide**: System configuration and maintenance
4. **Developer Guide**: Architecture and contribution guidelines
5. **Runbook**: Incident response procedures

## Cost Analysis (Missing)

### Recommended Budget Breakdown
- **Development**: $300K (60%%)
- **Infrastructure**: $50K/year (10%%)
- **Marketing**: $75K (15%%)
- **Support**: $75K (15%%)
- **Total Year 1**: $500K

## Timeline Refinement

### Suggested Adjustments
- **Phase 1**: Add 2 weeks for user research
- **Phase 2**: Add 1 week for security audit
- **Phase 3**: Add 2 weeks for documentation and training

**Revised Timeline**: 7 months (vs. original 6 months)

## Conclusion

The PRD is well-structured and addresses core requirements effectively. Implementing the recommendations above will significantly reduce project risks and improve product quality.

### Priority Actions
1. **Immediate**: Conduct user research and validate assumptions
2. **Week 1**: Detail error handling and edge cases
3. **Week 2**: Enhance security specifications
4. **Week 3**: Develop comprehensive testing strategy

### Approval Recommendation
**Status**: Conditional Approval
**Conditions**: Address high-impact issues (items 2, 4, and security enhancements)

---

*This is a mock AI-generated review for testing purposes.*
`, title, timestamp, title)
}

// GeneratePhase3Response generates a mock Claude comparison response
func (m *MockAIGenerator) GeneratePhase3Response(title, phase1Content, phase2Content string) string {
	timestamp := time.Now().Format("2006-01-02 15:04:05")

	return fmt.Sprintf(`# Final Product Requirements Document: %s

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

## Documentation Deliverables

### Technical Documentation
1. **Architecture Decision Records (ADRs)**: 10+ decisions documented
2. **API Documentation**: OpenAPI spec + Postman collection
3. **Database Schema**: ER diagrams + migration scripts
4. **Deployment Guide**: Step-by-step infrastructure setup

### User Documentation
1. **User Guide**: 20-page illustrated guide
2. **Video Tutorials**: 5 core workflow videos (2-3 min each)
3. **FAQ**: 30 common questions
4. **Release Notes**: Version history with changes

### Operational Documentation
1. **Runbook**: Incident response procedures
2. **Monitoring Guide**: Alert definitions and responses
3. **Backup/Recovery**: Disaster recovery procedures
4. **Scaling Guide**: Capacity planning and scaling triggers

## Success Metrics (Refined)

### Product Metrics
| Metric | Baseline | Target (3mo) | Target (6mo) | Target (12mo) |
|--------|----------|--------------|--------------|---------------|
| DAU | 0 | 2,000 | 5,000 | 10,000 |
| WAU | 0 | 8,000 | 20,000 | 40,000 |
| MAU | 0 | 25,000 | 60,000 | 120,000 |
| Retention (D7) | N/A | 40%% | 50%% | 60%% |
| NPS | N/A | 30 | 50 | 70 |

### Technical Metrics
| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| API Response Time (p95) | 2000ms | 500ms | CloudWatch |
| Error Rate | 5%% | <1%% | Application logs |
| Uptime | 95%% | 99.9%% | Pingdom |
| Page Load Time | 5s | 2s | Lighthouse |

### Business Metrics
| Metric | Target (Year 1) | Measurement |
|--------|-----------------|-------------|
| ARR | $500K | Billing system |
| CAC | $50 | Marketing analytics |
| LTV | $500 | User analytics |
| Churn Rate | <5%%/month | Subscription data |

## Implementation Timeline (Revised)

### Month 1-2: Foundation + Research
- Week 1-2: User research (10-15 interviews)
- Week 3-4: Infrastructure setup
- Week 5-6: Core backend development
- Week 7-8: Core frontend development

### Month 3-4: MVP Development
- Week 9-10: Feature implementation
- Week 11-12: Integration testing
- Week 13-14: Security hardening
- Week 15-16: Internal beta testing

### Month 5-6: Enhancement + Launch Prep
- Week 17-18: UI/UX refinement
- Week 19-20: Performance optimization
- Week 21-22: Documentation completion
- Week 23-24: External beta testing

### Month 7: Launch
- Week 25-26: Production deployment
- Week 27-28: Marketing campaign + user onboarding

## Risk Management (Enhanced)

### Risk Matrix

| Risk | Probability | Impact | Mitigation | Owner |
|------|-------------|--------|------------|-------|
| Scalability issues | Medium | High | Load testing, auto-scaling | DevOps Lead |
| Security breach | Low | Critical | Penetration testing, audits | Security Lead |
| Low adoption | Medium | High | User research, beta program | Product Manager |
| Timeline delays | High | Medium | Agile sprints, buffer time | Project Manager |
| Budget overrun | Medium | Medium | Weekly budget reviews | Finance Lead |
| Key person risk | Low | High | Documentation, knowledge sharing | Engineering Manager |

## Budget (Detailed)

### Development Costs
- **Engineering**: $250K (5 engineers × 6 months)
- **Design**: $50K (1 designer × 6 months)
- **QA**: $40K (1 QA engineer × 4 months)
- **Project Management**: $30K (0.5 PM × 6 months)

### Infrastructure Costs (Year 1)
- **AWS Services**: $30K
- **Third-party SaaS**: $15K (monitoring, analytics)
- **SSL Certificates**: $1K
- **Domain/DNS**: $500

### Marketing Costs
- **Launch Campaign**: $50K
- **Content Creation**: $15K
- **SEO/SEM**: $10K

### Support Costs
- **Support Engineers**: $60K (2 engineers × 6 months)
- **Support Tools**: $5K

**Total Year 1 Budget**: $556,500

## Approval and Sign-off

### Stakeholder Review
- [ ] Product Owner: _______________
- [ ] Engineering Lead: _______________
- [ ] Design Lead: _______________
- [ ] Security Lead: _______________
- [ ] Finance: _______________

### Next Steps
1. **Immediate**: Stakeholder review and approval
2. **Week 1**: Kick-off meeting and team formation
3. **Week 2**: Begin user research
4. **Week 3**: Start infrastructure setup

---

## Appendices

### Appendix A: User Interview Protocol
*(10-page detailed interview guide)*

### Appendix B: API Specification
*(OpenAPI 3.0 specification)*

### Appendix C: Database Schema
*(ER diagrams and table definitions)*

### Appendix D: Security Checklist
*(OWASP Top 10 compliance matrix)*

### Appendix E: Accessibility Checklist
*(WCAG 2.1 AA compliance matrix)*

---

**Document Status**: Final
**Version**: 3.0
**Last Updated**: %s
**Next Review**: 3 months post-launch

*This is a comprehensive mock AI-generated PRD for testing purposes.*
`, title, timestamp, title, timestamp)
}
