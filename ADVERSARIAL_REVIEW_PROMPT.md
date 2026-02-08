# Adversarial Review: Product Requirements Assistant

You are a meticulous QA engineer tasked with finding MISALIGNMENTS between 5 components that must be perfectly synchronized. Your job is to identify where these components contradict, diverge, or create scoring gaps.

## The 5-Component Chain

1. **phase1.md** - User-facing prompt that generates PRD drafts
2. **phase2.md** - Gemini review prompt
3. **phase3.md** - Synthesis prompt combining Phase 1 + Phase 2
4. **prompts.js** - LLM scoring rubric
5. **validator.js** - JavaScript heuristic scorer

## Your Mission

Find ALL misalignments across these categories:

### A. Dimension Weight Misalignments
- Do all components agree on the 5 dimensions and their weights?
  - Document Structure: 20 pts
  - Requirements Clarity: 25 pts
  - User Focus: 20 pts
  - Technical Quality: 15 pts
  - Strategic Viability: 20 pts

### B. Section Requirements Misalignments
- phase1.md defines 14 required sections with specific weights
- Does phase2.md match these section weights?
- Does prompts.js mention the same sections?
- Does validator.js REQUIRED_SECTIONS array match?

### C. Terminology Inconsistencies
- Different names for the same concept across files
- Example: "Customer FAQ" vs "External FAQ" vs "Working Backwards"
- Example: "Hypothesis Kill Switch" vs "Kill Criteria" vs "Failure Criteria"

### D. Detection Pattern Gaps
- Things mentioned in phase1/2/3 that validator.js doesn't detect
- Things validator.js scores that prompts.js doesn't mention
- Scoring guidance in prompts.js without corresponding validator.js logic

### E. Vague Language Lists
- Do VAGUE_LANGUAGE categories in validator.js match phase1.md's "Banned Vague Language"?
- Are penalty points consistent across components?

### F. Strategic Viability Alignment
- phase1.md has specific requirements for: Leading/Lagging indicators, Counter-metrics, Source of Truth, Kill Switch, Door Types, Alternatives Considered, Dissenting Opinions
- Does prompts.js score all of these?
- Does validator.js detect all of these patterns?

### G. Acceptance Criteria Requirements
- phase1.md requires ACs for BOTH success AND failure cases
- Does validator.js check for failure case ACs?
- Does prompts.js mention this requirement?

### H. Traceability Requirements
- phase1.md requires Problem ID → Requirement ID → Metric ID mapping
- Is this consistently scored across all components?

---

## COMPONENT 1: phase1.md (User-Facing Prompt)

Key requirements from phase1.md:
- 14 required sections with specific weights
- Banned vague language: "improve", "enhance", "user-friendly", "efficient", "scalable", "better", "optimize", "faster", "easier"
- Functional Requirements must have: ID (FR1, FR2), Problem Link (P1, P2), Door Type (🚪/🔄), Acceptance Criteria (success AND failure)
- Success Metrics must have: Metric Name, Type (Leading/Lagging), Baseline, Target, Timeline, Source of Truth, Counter-Metric
- Hypothesis Kill Switch required
- Customer FAQ must appear BEFORE Proposed Solution
- Alternatives Considered section required
- Dissenting Opinions section required
- Traceability Summary required (Problem → Requirements → Metrics)

---

## COMPONENT 2: phase2.md (Gemini Review Prompt)

Key scoring from phase2.md:
- Document Structure: 20 pts (14 sections with weights matching phase1.md)
- Requirements Clarity: 25 pts
- User Focus: 20 pts
- Technical Quality: 15 pts
- Strategic Viability: 20 pts (includes Leading indicators, Counter-metrics, Source of Truth, Kill switch, Alternatives, Dissenting opinions, Traceability, Risk quality, Scope realism)

---

## COMPONENT 3: phase3.md (Synthesis Prompt)

Quality Gate checklist includes:
- All 14 sections present
- Customer FAQ BEFORE Proposed Solution
- Every requirement tagged as One-Way/Two-Way Door
- ACs include BOTH success AND failure cases
- Leading Indicators present
- Counter-Metrics defined
- Source of Truth specified
- Kill Switch defined

---

## COMPONENT 4: prompts.js (LLM Scoring Prompt)

Scoring rubric:
- Document Structure (20 pts): Core Sections 10, Organization 5, Formatting 3, Scope Boundaries 2
- Requirements Clarity (25 pts): Precision 7, Completeness 7, Measurability 6, Prioritization 5
- User Focus (20 pts): Personas 5, Problem Statement 5, Alignment 5, Customer Evidence 5
- Technical Quality (15 pts): NFRs 5, Acceptance Criteria 5, Dependencies 5
- Strategic Viability (20 pts): Metric Validity 6, Scope Realism 5, Risk Quality 5, Traceability 4

Calibration guidance mentions: vague qualifiers, weasel words, marketing fluff, MoSCoW, customer quotes, One-Way/Two-Way Door, Kill Switch, Alternatives Considered, Dissenting Opinions

---

## COMPONENT 5: validator.js (JavaScript Scorer)

Key patterns:
- REQUIRED_SECTIONS: 14 sections with weights (total 20 pts)
- VAGUE_LANGUAGE: qualifiers, quantifiers, temporal, weaselWords, marketingFluff, unquantifiedComparatives
- STRATEGIC_VIABILITY_PATTERNS: leadingIndicator, laggingIndicator, counterMetric, sourceOfTruth, killSwitch, traceability, doorType, alternativesConsidered, dissentingOpinions, customerFAQ, ahaQuote

Scoring functions:
- scoreDocumentStructure(): 20 pts max
- scoreRequirementsClarity(): 25 pts max
- scoreUserFocus(): 20 pts max
- scoreTechnicalQuality(): 15 pts max
- scoreStrategicViability(): 20 pts max

---

## COMPONENT 6: Scoring_Methods.md (Reference Documentation)

Documents the scoring taxonomy and vague language penalties.

---

## YOUR TASK

Analyze all 6 components and produce a table of misalignments:

| Issue # | Component A | Component B | Misalignment Description | Severity (High/Med/Low) | Recommended Fix |
|---------|-------------|-------------|--------------------------|-------------------------|-----------------|
| 1 | phase1.md | validator.js | ... | ... | ... |

Focus on:
1. **Weight mismatches** - Same dimension scored differently
2. **Missing patterns** - Concept in prompts not detected in validator.js
3. **Terminology drift** - Same concept, different names
4. **Penalty inconsistencies** - Different penalty amounts for same offense
5. **Section weight divergence** - phase1.md vs validator.js REQUIRED_SECTIONS weights
6. **Strategic Viability gaps** - Missing detection patterns for items in prompts

**Be adversarial. Find every gap.**
