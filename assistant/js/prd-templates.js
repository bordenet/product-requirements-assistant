/**
 * PRD Templates - Pre-filled content for common PRD types
 * @module prd-templates
 */

/**
 * Available PRD templates
 * Each template provides structured prompts for the Problems and Context fields
 */
export const PRD_TEMPLATES = {
  blank: {
    id: 'blank',
    name: 'Blank PRD',
    icon: '📄',
    description: 'Start from scratch',
    problems: '',
    context: ''
  },

  newFeature: {
    id: 'newFeature',
    name: 'New Feature',
    icon: '✨',
    description: 'Customer-facing product feature',
    problems: `[What user problem are we solving?]

User pain points:
1. [Pain point 1 - be specific with user quotes or data]
2. [Pain point 2]

Current workarounds:
- [How do users solve this today?]

Business impact:
- [Revenue/retention/engagement metric affected]`,
    context: `Target users: [Specific user persona or segment]

Success metrics:
- [Primary metric: e.g., "Increase feature adoption to 40%"]
- [Secondary metric]

Constraints:
- Timeline: [Target launch date]
- Dependencies: [Other teams, systems, or features required]

Out of scope:
- [What we explicitly won't build in v1]`
  },

  platformMigration: {
    id: 'platformMigration',
    name: 'Platform Migration',
    icon: '🔄',
    description: 'Technical migration or infrastructure change',
    problems: `[What technical limitation or risk are we addressing?]

Current state:
- Platform/system: [Current technology stack]
- Limitations: [Scalability, reliability, cost issues]
- Technical debt: [Accumulated issues]

Risks of not migrating:
1. [Risk 1 with quantified impact]
2. [Risk 2]

Target state:
- [Desired end architecture]`,
    context: `Migration strategy: [Big bang / Phased / Strangler pattern]

Non-functional requirements:
- Performance: [Latency targets, throughput requirements]
- Reliability: [Uptime SLA, disaster recovery]
- Scalability: [Expected load, growth projections]

Rollback plan:
- [How do we revert if something goes wrong?]

Testing strategy:
- [How do we validate the migration succeeded?]

Timeline:
- Phase 1: [Date - Scope]
- Phase 2: [Date - Scope]`
  },

  internalTool: {
    id: 'internalTool',
    name: 'Internal Tool',
    icon: '🛠️',
    description: 'Employee productivity or operations tool',
    problems: `[What internal process is broken or inefficient?]

Current process:
1. [Step 1 - manual, time-consuming, error-prone?]
2. [Step 2]

Time wasted: [Hours/week across team]
Error rate: [% of errors in current process]

Who is affected:
- [Team A - X people]
- [Team B - Y people]`,
    context: `Internal users: [Specific roles/teams]

Integration requirements:
- [Existing systems this must connect to]
- [Authentication: SSO, service accounts, etc.]

Access control:
- [Who can view vs edit vs admin?]

Success metrics:
- [Time saved: X hours/week]
- [Error reduction: from Y% to Z%]

MVP scope:
- Must have: [Core functionality]
- Nice to have: [Future iterations]`
  },

  apiPlatform: {
    id: 'apiPlatform',
    name: 'API / Platform',
    icon: '🔌',
    description: 'Developer platform, API, or SDK',
    problems: `[What developer experience problem are we solving?]

Developer pain points:
1. [Integration complexity]
2. [Missing functionality]
3. [Performance issues]

Current workarounds:
- [How do developers solve this today?]

Competitive landscape:
- [What do alternatives offer?]`,
    context: `Target developers: [Internal / External / Partner]

API design principles:
- [RESTful / GraphQL / gRPC]
- [Versioning strategy]
- [Rate limiting / quotas]

Documentation requirements:
- [API reference, tutorials, code samples]

Security requirements:
- [Authentication: API keys, OAuth, etc.]
- [Authorization model]

SLA targets:
- Availability: [99.X%]
- Latency: [p50, p95, p99]`
  }
};

/**
 * Get template by ID
 * @param {string} templateId - Template identifier
 * @returns {Object|null} Template object or null if not found
 */
export function getTemplate(templateId) {
  return PRD_TEMPLATES[templateId] || null;
}

/**
 * Get all templates as an array (for rendering template selector)
 * @returns {Array} Array of template objects
 */
export function getAllTemplates() {
  return Object.values(PRD_TEMPLATES);
}
