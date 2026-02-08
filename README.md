# Product Requirements Assistant

Write PRDs with AI. Three phases: draft, review, refine.

[![Star this repo](https://img.shields.io/github/stars/bordenet/product-requirements-assistant?style=social)](https://github.com/bordenet/product-requirements-assistant)

**Try it**: [Assistant](https://bordenet.github.io/product-requirements-assistant/) · [Validator](https://bordenet.github.io/product-requirements-assistant/validator/)

> **What is a PRD?** A [Product Requirements Document](https://en.wikipedia.org/wiki/Product_requirements_document) defines what a product should do and why. It specifies user needs, features, constraints, and success criteria—without prescribing implementation. PRDs align engineering, design, and business before development begins.

[![CI](https://github.com/bordenet/product-requirements-assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/product-requirements-assistant/actions)
[![codecov](https://codecov.io/gh/bordenet/product-requirements-assistant/branch/main/graph/badge.svg)](https://codecov.io/gh/bordenet/product-requirements-assistant)

---

## Quick Start

1. Open the [demo](https://bordenet.github.io/product-requirements-assistant/)
2. Enter product context, user needs, requirements
3. Copy prompt → paste into Claude → paste response back
4. Repeat for review (Gemini) and synthesis (Claude)
5. Export as Markdown

## What It Does

- **Draft → Review → Synthesize**: Claude writes, Gemini critiques, Claude refines
- **Browser storage**: Data stays in IndexedDB, nothing leaves your machine
- **No login**: Just open and use
- **Dark mode**: Toggle in the UI

## How the Phases Work

**Phase 1** — You describe the product. Claude drafts a PRD.

**Phase 2** — Gemini reviews: What's ambiguous? What edge cases are missing? What requirements conflict?

**Phase 3** — Claude takes the draft plus critique and produces a final version.

---

## Scoring Methodology

The validator scores PRDs on a 100-point scale across five dimensions. This scoring system addresses the "Kitchen Sink PRD" anti-pattern—documents that include everything but commit to nothing. The weights prioritize requirements clarity and strategic viability over structural completeness.

### Scoring Taxonomy

| Category | Weight | Rationale |
|----------|--------|-----------|
| **Document Structure** | 20 pts | Validates 14 required sections with proper organization |
| **Requirements Clarity** | 25 pts | Ensures precision, completeness, and prioritization |
| **User Focus** | 20 pts | Validates personas, problem statements, and customer evidence |
| **Technical Quality** | 15 pts | Checks NFRs, acceptance criteria, and dependencies |
| **Strategic Viability** | 20 pts | Validates metric validity, scope realism, and traceability |

### Why These Weights?

**Document Structure (20 pts)** ensures baseline PRD completeness:
- **Core sections** (10 pts): All 14 required sections present (Executive Summary through Dissenting Opinions)
- **Organization** (5 pts): Logical flow, heading hierarchy, Customer FAQ BEFORE Proposed Solution
- **Formatting** (3 pts): Consistent bullets, tables for structured data
- **Scope boundaries** (2 pts): Explicit "In Scope" AND "Out of Scope" definitions

**Requirements Clarity (25 pts)** is the highest-weighted category because unclear requirements are the root cause of project failure:
- **Precision** (7 pts): No vague qualifiers, weasel words, or marketing fluff
- **Completeness** (7 pts): Functional Requirements with ID (FR1, FR2), Problem Link, Door Type, Acceptance Criteria
- **Measurability** (6 pts): Specific numbers, percentages, timeframes, or counts
- **Prioritization** (5 pts): MoSCoW (Must/Should/Could/Won't), P0/P1/P2, or explicit priority ranking

**User Focus (20 pts)** prevents solution-first thinking:
- **User personas** (5 pts): Detailed descriptions of who uses the product, roles, needs
- **Problem statement** (5 pts): Clear problem definition, value proposition, "why" behind the product
- **Alignment** (5 pts): Requirements trace back to user needs, features serve identified personas
- **Customer evidence** (5 pts): User research, interview quotes, Customer FAQ, "Aha!" moment quote

**Technical Quality (15 pts)** addresses implementation readiness:
- **Non-functional requirements** (5 pts): Performance, security, reliability, scalability, compliance
- **Acceptance criteria** (5 pts): Given/When/Then for BOTH success AND failure/edge cases
- **Dependencies/constraints** (5 pts): Risks, assumptions, blockers documented

**Strategic Viability (20 pts)** catches PRDs that look complete but are actually unachievable:
- **Metric validity** (6 pts): Leading indicators present, counter-metrics defined, Source of Truth specified
- **Scope realism** (5 pts): Scope is achievable within stated timeline
- **Risk & mitigation quality** (5 pts): Risks are specific (not "we might run late"), mitigations actionable
- **Traceability** (4 pts): Every requirement traces to a Problem ID, every problem has a Metric ID

### Adversarial Robustness

The scoring system addresses common PRD failures:

| Gaming Attempt | Why It Fails |
|----------------|--------------|
| Adding all 14 sections with thin content | Requirements Clarity scores content quality, not just presence |
| Vague requirements like "fast performance" | Measurability requires specific numbers with units |
| Omitting priorities | Prioritization is explicitly scored; no MoSCoW = point loss |
| Generic risk statements | Risk quality requires specific risks with actionable mitigations |
| Missing failure acceptance criteria | AC must cover success AND failure/edge cases |

### Calibration Notes

The **traceability requirement** (4 pts) implements requirement-to-problem linking. Every FR must reference a Problem ID; every problem must reference a Metric ID. This creates an audit trail that prevents orphan requirements ("FR7 exists, but why?").

The **Functional Requirements format** (FR1, FR2 with Problem Link, Door Type, AC) is mandatory. "Door Type" refers to one-way vs. two-way door decisions—a concept from Amazon's decision-making framework. One-way doors (irreversible) require more scrutiny than two-way doors (easily reversed).

---

## Validate Your PRD

Once you've completed your PRD, run it through the **[PRD Validator](https://bordenet.github.io/product-requirements-assistant/validator/)** for instant scoring and AI-powered improvement suggestions. The validator checks document structure, requirements clarity, user focus, and technical quality—giving you a 0-100 score with actionable feedback.

→ **[Try the Validator](https://bordenet.github.io/product-requirements-assistant/validator/)**

## Usage

1. Open the app
2. Click "New Project", fill in your inputs
3. Copy each phase's prompt to the appropriate AI, paste responses back
4. Export when done

**Mock mode**: On localhost, toggle "AI Mock Mode" (bottom-right) to skip the copy/paste loop. Useful for testing.

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/bordenet/product-requirements-assistant.git
cd product-requirements-assistant
npm install
```

### Testing

```bash
npm test        # Run all tests
npm run lint    # Run linting
npm run lint:fix # Fix lint issues
```

### Local Development

```bash
npm run serve   # Start local server at http://localhost:8000
```

## Project Structure

```
product-requirements-assistant/
├── js/                    # JavaScript modules
│   ├── app.js            # Main application entry
│   ├── workflow.js       # Phase orchestration
│   ├── storage.js        # IndexedDB operations
│   └── ...
├── tests/                 # Jest test files
├── prompts/              # AI prompt templates
│   ├── phase1.md
│   ├── phase2.md
│   └── phase3.md
└── index.html            # Main HTML file
```

## Part of Genesis Tools

Built with [Genesis](https://github.com/bordenet/genesis). Related tools:

- [Acceptance Criteria Assistant](https://github.com/bordenet/acceptance-criteria-assistant)
- [Architecture Decision Record](https://github.com/bordenet/architecture-decision-record)
- [Business Justification Assistant](https://github.com/bordenet/business-justification-assistant)
- [JD Assistant](https://github.com/bordenet/jd-assistant)
- [One-Pager](https://github.com/bordenet/one-pager)
- [Power Statement Assistant](https://github.com/bordenet/power-statement-assistant)
- [PR/FAQ Assistant](https://github.com/bordenet/pr-faq-assistant)
- [Product Requirements Assistant](https://github.com/bordenet/product-requirements-assistant)
- [Strategic Proposal](https://github.com/bordenet/strategic-proposal)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE)
