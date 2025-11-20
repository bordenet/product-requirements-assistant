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

const phase2Template = `# Critical Analysis: %s

**Review Date**: %s
**Model**: Gemini 2.5 Pro (Mock)
**Analysis Type**: Technical & Strategic PRD Review

---

## Executive Summary

I've analyzed the proposed PRD for **%s** across six dimensions: technical architecture, user experience, business viability, risk management, implementation feasibility, and compliance requirements. The document demonstrates strong foundational thinking but requires refinement in several critical areas before proceeding to implementation.

**Overall Score**: 7.2/10
**Recommendation**: Proceed with modifications (see Priority Actions below)

---

## Dimensional Analysis

### 1. Technical Architecture (Score: 7/10)

**What Works:**
- Clear separation of concerns in proposed system design
- Appropriate technology stack selection for stated requirements
- Scalability considerations are present

**Critical Gaps:**
- **Database Schema**: No entity-relationship diagram or schema definition provided
- **API Contract**: Missing OpenAPI specification or endpoint documentation
- **State Management**: Client-side state handling strategy undefined
- **Caching Strategy**: No mention of caching layers (CDN, application, database)

**Specific Recommendations:**

1. Define database schema with:
   - Primary/foreign key relationships
   - Indexing strategy for query optimization
   - Data migration approach

2. Document API contract:
   - Request/response schemas
   - Authentication flow
   - Rate limiting parameters
   - Versioning strategy (recommend semantic versioning)

3. Specify caching:
   - CDN for static assets (CloudFront, Cloudflare)
   - Redis for session/application cache
   - Database query result caching with TTL

### 2. Error Handling & Edge Cases (Score: 5/10)

**Major Deficiency**: The PRD lacks comprehensive error scenario coverage.

**Required Additions:**
- **Network Failures**: Retry logic with exponential backoff (max 3 retries, 2^n seconds)
- **Validation Errors**: Client-side and server-side validation with specific error messages
- **Timeout Handling**: Define timeout thresholds (API: 30s, DB queries: 5s)
- **Partial Failures**: Circuit breaker pattern for third-party dependencies
- **Data Inconsistency**: Transaction rollback procedures and conflict resolution

**Example Error Taxonomy Needed:**

4xx Client Errors:
  - 400: Invalid request format
  - 401: Authentication required
  - 403: Insufficient permissions
  - 404: Resource not found
  - 429: Rate limit exceeded

5xx Server Errors:
  - 500: Internal server error
  - 502: Upstream service unavailable
  - 503: Service temporarily unavailable
  - 504: Gateway timeout

### 3. Security & Compliance (Score: 6/10)

**Strengths:**
- GDPR awareness demonstrated
- HTTPS mentioned for data in transit

**Critical Omissions:**

**Authentication & Authorization:**
- No specification of authentication mechanism (JWT, OAuth 2.0, session-based)
- Missing role-based access control (RBAC) definition
- No multi-factor authentication (MFA) requirement

**Data Protection:**
- Encryption at rest not specified (recommend AES-256)
- Key management strategy undefined (AWS KMS, HashiCorp Vault)
- PII handling procedures missing
- Data retention policy vague (specify: 90 days for logs, 7 years for transactions)

**Compliance Requirements:**
- GDPR: Need explicit consent flow, data portability API, deletion workflow
- SOC 2 Type II: If handling enterprise data, audit requirements needed
- CCPA: California users require specific opt-out mechanisms

**Required Security Measures:**
1. Input sanitization on all user-provided data (prevent XSS, SQL injection)
2. Rate limiting: 100 requests/minute per user, 1000/minute per IP
3. CORS policy definition
4. Content Security Policy (CSP) headers
5. Dependency vulnerability scanning (Snyk, Dependabot)
6. Penetration testing before launch

### 4. Performance & Scalability (Score: 7/10)

**Positive Elements:**
- Load targets mentioned (good starting point)
- Scalability considerations present

**Needs Quantification:**

**Response Time Requirements:**
- API endpoints: < 200ms (p95), < 500ms (p99)
- Page load: < 2s (initial), < 1s (subsequent)
- Database queries: < 50ms (simple), < 200ms (complex)

**Throughput Targets:**
- Concurrent users: Specify expected (1,000) and peak (5,000)
- Requests per second: Define baseline (100 RPS) and target (500 RPS)
- Data volume: Current (10GB) and projected growth (100GB/year)

**Scalability Strategy:**
- Horizontal scaling: Auto-scaling groups with CPU > 70%% trigger
- Database: Read replicas for query distribution, sharding strategy for > 1TB
- CDN: Static asset distribution to reduce origin load
- Load balancing: Application Load Balancer with health checks

### 5. Testing Strategy (Score: 4/10)

**Major Gap**: Testing approach is superficial.

**Required Test Coverage:**

Unit Tests (80%% minimum):
- All business logic functions
- Edge cases and boundary conditions
- Error handling paths

Integration Tests:
- API endpoint contracts
- Database operations
- Third-party service integrations
- Authentication flows

End-to-End Tests:
- Critical user journeys (5-7 scenarios)
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Mobile responsiveness (iOS Safari, Chrome Android)

Performance Tests:
- Load testing: Sustained 2x expected traffic for 1 hour
- Stress testing: Find breaking point (increase load until failure)
- Soak testing: 24-hour run at expected load

Security Tests:
- OWASP Top 10 vulnerability scanning
- Dependency audit (npm audit, go mod verify)
- Penetration testing by third party

### 6. User Experience & Accessibility (Score: 6/10)

**Strengths:**
- User-centric problem framing
- Clear feature descriptions

**Accessibility Gaps:**

WCAG 2.1 AA Compliance Required:
- Keyboard navigation: All interactive elements accessible via Tab/Enter
- Screen readers: ARIA labels on all form inputs and buttons
- Color contrast: Minimum 4.5:1 for text, 3:1 for UI components
- Focus indicators: Visible focus state on all interactive elements
- Alt text: Descriptive alternatives for all images and icons

**UX Improvements:**
- Loading states: Skeleton screens or spinners for async operations
- Error messages: Specific, actionable guidance (not generic "Error occurred")
- Empty states: Helpful prompts when no data exists
- Confirmation dialogs: For destructive actions (delete, overwrite)
- Undo functionality: For critical user actions

---

## Risk Analysis

### Technical Risks

**Risk 1: Third-Party API Dependency**
- Probability: Medium (40%%)
- Impact: High
- Mitigation: Implement circuit breakers, maintain fallback mechanisms, contract SLA guarantees

**Risk 2: Database Performance Degradation**
- Probability: Medium (35%%)
- Impact: High
- Mitigation: Query optimization, connection pooling, read replicas, caching layer

**Risk 3: Security Breach**
- Probability: Low (15%%)
- Impact: Critical
- Mitigation: Regular security audits, bug bounty program, incident response plan

### Business Risks

**Risk 4: User Adoption Below Target**
- Probability: Medium (45%%)
- Impact: High
- Mitigation: Beta testing with 50-100 users, iterative feedback incorporation, marketing campaign

**Risk 5: Scope Creep**
- Probability: High (60%%)
- Impact: Medium
- Mitigation: Strict change control process, prioritization framework, stakeholder alignment

---

## Priority Actions (Ranked by Impact)

### Critical (Must Address Before Development)

1. **Define Error Handling Strategy** (Impact: High, Effort: Medium)
   - Document all error scenarios
   - Specify retry logic and fallback behaviors
   - Create error message catalog

2. **Complete Security Specification** (Impact: Critical, Effort: High)
   - Authentication mechanism selection
   - Authorization model (RBAC)
   - Data encryption strategy
   - Compliance checklist (GDPR, CCPA)

3. **Establish Testing Framework** (Impact: High, Effort: High)
   - Unit test requirements (80%% coverage)
   - Integration test scenarios
   - Performance benchmarks
   - Security testing plan

### High Priority (Address in Sprint 1)

4. **API Contract Definition** (Impact: High, Effort: Medium)
   - OpenAPI 3.0 specification
   - Request/response schemas
   - Authentication flows
   - Rate limiting rules

5. **Database Schema Design** (Impact: High, Effort: Medium)
   - Entity-relationship diagram
   - Indexing strategy
   - Migration plan
   - Backup/recovery procedures

### Medium Priority (Address in Sprint 2-3)

6. **Accessibility Compliance** (Impact: Medium, Effort: Medium)
   - WCAG 2.1 AA audit
   - Keyboard navigation implementation
   - Screen reader testing

7. **Performance Baselines** (Impact: Medium, Effort: Low)
   - Current system metrics
   - Target performance goals
   - Monitoring dashboard

---

## Quantitative Assessment

| Dimension | Score | Weight | Weighted Score |
|-----------|-------|--------|----------------|
| Technical Architecture | 7/10 | 25%% | 1.75 |
| Error Handling | 5/10 | 15%% | 0.75 |
| Security & Compliance | 6/10 | 20%% | 1.20 |
| Performance & Scalability | 7/10 | 15%% | 1.05 |
| Testing Strategy | 4/10 | 15%% | 0.60 |
| UX & Accessibility | 6/10 | 10%% | 0.60 |
| **Overall** | **7.2/10** | **100%%** | **5.95/10** |

---

## Final Recommendation

**Decision**: Proceed with modifications

**Rationale**: The PRD demonstrates solid strategic thinking and appropriate technology choices. However, critical gaps in error handling, security specification, and testing strategy must be addressed before development begins. The proposed timeline should be extended by 3-4 weeks to accommodate these additions.

**Confidence Level**: High (85%%)

**Next Steps**:
1. Address all Critical priority items (estimated 2-3 weeks)
2. Conduct technical review with engineering team
3. Validate assumptions with 10-15 target users
4. Revise PRD with findings
5. Final approval gate before Sprint 1

---

*Analysis generated for testing and development purposes.*
`
