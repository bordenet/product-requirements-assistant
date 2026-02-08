# Product Requirements Assistant Scoring Methods

This document describes the scoring methodology used by the PRD Validator.

## Overview

The validator scores PRDs on a **100-point scale** across five dimensions reflecting product management rigor. The scoring emphasizes requirements clarity, user evidence, strategic viability, and traceability.

## Scoring Taxonomy

| Dimension | Points | What It Measures |
|-----------|--------|------------------|
| **Document Structure** | 20 | Section presence, organization, formatting |
| **Requirements Clarity** | 25 | Precision, completeness, vague language penalties |
| **User Focus** | 20 | Personas, problem statement, customer evidence |
| **Technical Quality** | 15 | NFRs, acceptance criteria, door type tagging |
| **Strategic Viability** | 20 | Metric validity, scope realism, traceability |

## Dimension Details

### 1. Document Structure (20 pts)

**Required Sections (14 total, weighted):**

| Section | Weight | Pattern |
|---------|--------|---------|
| Executive Summary | 2 | `^#+\s*executive\s+summary` |
| Problem Statement | 2 | `^#+\s*problem\s+statement` |
| Value Proposition | 2 | `^#+\s*value\s+proposition` |
| Goals and Objectives | 2 | `^#+\s*goal|objective|success\s+metric` |
| Customer FAQ | 2 | `^#+\s*customer\s+faq|external\s+faq` |
| Proposed Solution | 2 | `^#+\s*proposed\s+solution|core\s+functionality` |
| Requirements | 2 | `^#+\s*requirement|functional\s+requirement` |
| Scope | 1.5 | `^#+\s*scope|in.scope|out.of.scope` |
| Stakeholders | 1.5 | `^#+\s*stakeholder` |
| Timeline | 1 | `^#+\s*timeline|milestone` |
| Risks | 1 | `^#+\s*risk|mitigation` |
| Traceability Summary | 1 | `^#+\s*traceability|requirement\s+mapping` |
| Open Questions | 1 | `^#+\s*open\s+question` |
| Known Unknowns | 1 | `^#+\s*known\s+unknown|dissenting\s+opinion` |

### 2. Requirements Clarity (25 pts)

**Vague Language Detection (penalties):**

| Category | Examples | Impact |
|----------|----------|--------|
| Qualifiers | "easy to use", "user-friendly", "intuitive" | -2 pts each |
| Quantifiers | "many", "several", "a lot" | -1 pt each |
| Temporal | "soon", "quickly", "ASAP" | -2 pts each |
| Weasel Words | "should be able to", "generally" | -1 pt each |
| Marketing Fluff | "best-in-class", "cutting-edge" | -3 pts each |
| Unquantified Comparatives | "better", "faster", "improved" | -2 pts each |

**Prioritization Detection (+5 pts):**
- MoSCoW: "must have", "should have", "could have", "won't have"
- P-level: P0, P1, P2, P3
- Tiered: Phase 1/2/3, MVP, V1/V2

### 3. User Focus (20 pts)

**Customer Evidence Patterns:**
```javascript
research: /user research|customer research|user interview|usability test/gi
data: /data shows|analytics indicate|\d+%\s+of\s+(users|customers)/gi
feedback: /customer feedback|nps|csat|support ticket|pain point/gi
validation: /validated|tested with|pilot|dogfood|beta/gi
```

**User Story Detection:** `as a [role], I want...` (+3 pts if present)

**Problem-Solution Link:** Requires P1, P2 problem IDs linked to requirements

### 4. Technical Quality (15 pts)

**Acceptance Criteria (+5 pts):**
- Gherkin format: Given... When... Then...
- Measurable thresholds: `≤500ms`, `99.9%`, `<1% error rate`

**Non-Functional Requirements (+5 pts):**
- NFR IDs: NFR1, NFR2...
- Categories: performance, security, scalability, availability

**Door Type Tagging (+5 pts):**
```javascript
doorType: /one-way door|two-way door|🚪|🔄|irreversible|reversible/gi
```

### 5. Strategic Viability (20 pts)

**Metric Validity (+8 pts):**
- Leading indicators: adoption rate, activation, time to value
- Lagging indicators: revenue, NPS, churn, retention
- Counter-metrics: guardrails to prevent perverse incentives
- Source of truth: Mixpanel, Amplitude, Datadog, etc.

**Kill Switch Criteria (+4 pts):**
```javascript
killSwitch: /kill switch|pivot or persevere|failure criteria|rollback plan|abort criteria/gi
```

**Traceability (+4 pts):**
- FR1 → P1 (requirement traces to problem)
- Traceability matrix section present

**Alternatives Considered (+4 pts):**
- Section showing rejected approaches
- Trade-off analysis documented

## Adversarial Robustness

| Gaming Attempt | Why It Fails |
|----------------|--------------|
| "User-friendly interface" | Vague qualifier triggers penalty |
| MoSCoW without "have" | Requires "must have" not just "must" |
| Metrics without source | Source of truth pattern check |
| AC without Given/When/Then | Acceptance criteria pattern strict |
| "We considered alternatives" | Requires specific rejected approaches |

## Calibration Notes

### Customer Evidence Is Required
PRDs without customer research references score poorly. "We assume users want X" is not evidence.

### Traceability Prevents Scope Creep
Every requirement should trace to a problem. Orphan requirements = scope creep.

### Kill Switch Shows Maturity
Mature PRDs define failure criteria: "If adoption < 10% after 30 days, we pivot or kill."

## Score Interpretation

| Score Range | Grade | Interpretation |
|-------------|-------|----------------|
| 80-100 | A | Engineering-ready - clear, traceable, validated |
| 60-79 | B | Good - needs clarity or traceability work |
| 40-59 | C | Incomplete - vague requirements or missing evidence |
| 20-39 | D | Weak - major gaps in structure |
| 0-19 | F | Not a PRD - restart with template |

## Critique Output Format

When you validate a PRD, the critique provides actionable feedback:

**Score Summary:** X/100 with dimension breakdown

**Top 3 Issues:** Most critical gaps identified by the validator

**Questions to Improve Your PRD:**
- Specific questions about missing/weak areas
- Each question includes "Why this matters" explaining score impact
- Answering these questions provides content to improve the PRD

**Quick Wins:** Fixes that don't require additional user input

> **Note:** The critique does NOT output a rewritten PRD. It asks questions to help you gather the missing information needed to improve your score.

## Content Policies

### Customer Quotes
- **Real quotes only** - Do not fabricate customer quotes
- If no quotes available, mark section as "TBD - pending customer research"
- Format: `"[Quote]" — [Name/Role], [Context: Interview/Survey, Date]`

### Timeline and Milestones
- **Use relative timeframes** - "Week 1-2", "Month 1", "T+30 days"
- Avoid specific calendar dates unless user provides them
- Example: "Month 1-2: Discovery", "Week 3-6: Development"

## Related Files

- `validator/js/validator.js` - Implementation of scoring functions
- `validator/js/prompts.js` - LLM scoring prompt (aligned)
- `shared/prompts/phase1.md` - User-facing instructions (source of truth)
