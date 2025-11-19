package main

// Mock AI response templates for testing
// These templates generate realistic PRD content for automated testing

const phase1Template = `# Product Requirements Document: %s

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
`

const phase2Template = `# PRD Review and Recommendations: %s

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
`
