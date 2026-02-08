# ADVERSARIAL REVIEW: product-requirements-assistant

## CONTEXT: THE CROWN JEWEL

You are an expert prompt engineer performing an **ADVERSARIAL review** of LLM prompts for a Product Requirements Document (PRD) assistant tool. This is the **CROWN JEWEL** of the Genesis ecosystem - it must be **WORLD-CLASS**.

This tool uses a **3-phase LLM chain** plus **dual scoring systems**:
1. **Phase 1 (Claude)** - Generates initial PRD draft
2. **Phase 2 (Gemini)** - Reviews and improves with adversarial tension
3. **Phase 3 (Claude)** - Synthesizes final PRD
4. **LLM Scoring (prompts.js)** - Sends PRD to LLM for evaluation
5. **JavaScript Scoring (validator.js)** - Deterministic regex/pattern matching

---

## ⚠️ CRITICAL ALIGNMENT CHAIN

These 5 components **MUST be perfectly aligned**:

| Component | Purpose | Risk if Misaligned |
|-----------|---------|-------------------|
| phase1.md | Generates PRD structure | LLM produces content validator can't detect |
| phase2.md | Reviews and improves | Different criteria than scoring rubric |
| phase3.md | Final synthesis | Quality gate doesn't match validator |
| prompts.js | LLM scoring rubric | Scores dimensions validator doesn't check |
| validator.js | JavaScript scoring | Misses patterns prompts.js rewards |

**If ANY of these diverge on categories, weights, or detection logic, scores will mismatch by 15-30 points.**

---

## CURRENT TAXONOMY (5 dimensions, 100 pts total)

| Dimension | prompts.js | validator.js | Weight |
|-----------|------------|--------------|--------|
| Document Structure | 20 pts | 20 pts | Core sections, organization, formatting |
| Requirements Clarity | 25 pts | 25 pts | Precision, completeness, measurability, prioritization |
| User Focus | 20 pts | 20 pts | Personas, problem statement, alignment, evidence |
| Technical Quality | 15 pts | 15 pts | NFRs, acceptance criteria, dependencies |
| Strategic Viability | 20 pts | 20 pts | Metrics, scope realism, risks, traceability |

---

## COMPONENT 1: phase1.md (Claude - Initial Draft)

See: `shared/prompts/phase1.md` (393 lines)

**Key Elements:**
- 14 required sections (Executive Summary through Dissenting Opinions)
- Banned vague language list (improve, enhance, user-friendly, etc.)
- Focus on "Why" and "What", NOT "How"
- Working Backwards: Customer FAQ BEFORE Proposed Solution
- Door Type tagging: 🚪 One-Way vs 🔄 Two-Way
- Acceptance Criteria: BOTH success AND failure cases
- Traceability: Problem → Requirements → Metrics
- `<output_rules>` block for copy-paste ready output

---

## COMPONENT 2: phase2.md (Gemini - Review)

See: `shared/prompts/phase2.md` (191 lines)

**Key Elements:**
- Adversarial tension: CHALLENGE, not just improve
- 5 scoring dimensions (must match prompts.js):
  1. Document Structure (20 pts)
  2. Requirements Clarity (25 pts)
  3. User Focus (20 pts)
  4. Technical Quality (15 pts)
  5. Strategic Viability (20 pts)
- Section weight table matching validator.js
- `<output_rules>` block for copy-paste ready output

---

## COMPONENT 3: phase3.md (Claude - Synthesis)

See: `shared/prompts/phase3.md` (179 lines)

**Key Elements:**
- Quality Gate checklist matching validator scoring
- Structure & Completeness (20 pts)
- Requirements Quality (25 pts)
- Strategic Viability (20 pts)
- User Focus (20 pts)
- Technical Quality (15 pts)
- `<output_rules>` block for copy-paste ready output

---

## COMPONENT 4: prompts.js (LLM Scoring Rubric)

See: `validator/js/prompts.js` (200 lines)

**Scoring Rubric (0-100 points):**

### 1. Document Structure (20 points)
- Core Sections (10 pts): All 14 required sections present
- Organization (5 pts): Logical flow, Customer FAQ BEFORE Proposed Solution
- Formatting (3 pts): Consistent bullets, tables
- Scope Boundaries (2 pts): Explicit In/Out of Scope

### 2. Requirements Clarity (25 points)
- Precision (7 pts): No vague qualifiers, weasel words, marketing fluff
- Completeness (7 pts): User stories with "As a..., I want..., So that..."
- Measurability (6 pts): Specific numbers, percentages, timeframes
- Prioritization (5 pts): MoSCoW or P0/P1/P2

### 3. User Focus (20 points)
- User Personas (5 pts): Detailed descriptions
- Problem Statement (5 pts): Clear problem, value proposition
- Alignment (5 pts): Requirements trace to user needs
- Customer Evidence (5 pts): Research, quotes, Customer FAQ, Aha moment

### 4. Technical Quality (15 points)
- Non-Functional Requirements (5 pts): Performance, security, reliability
- Acceptance Criteria (5 pts): Given/When/Then for success AND failure
- Dependencies/Constraints (5 pts): Risks, assumptions, blockers

### 5. Strategic Viability (20 points)
- Metric Validity (6 pts): Leading indicators, counter-metrics, Source of Truth
- Scope Realism (5 pts): Achievable within timeline
- Risk & Mitigation Quality (5 pts): Specific risks, actionable mitigations
- Traceability (4 pts): Problem → Requirement → Metric mapping

**Calibration Guidance:**
- Be HARSH. Most PRDs score 40-60. Only exceptional PRDs score 80+.
- Reward: MoSCoW prioritization, customer quotes, Customer FAQ, door types, kill switch, alternatives, dissenting opinions
- Deduct: vague qualifiers, weasel words, marketing fluff, missing sections, all P0 (no prioritization), metrics without Source of Truth

---

## COMPONENT 5: validator.js (JavaScript Scoring Logic)

See: `validator/js/validator.js` (1223 lines)

**Key Patterns:**

### REQUIRED_SECTIONS (14 total, weighted for 20 pts max)
```javascript
{ pattern: /executive\s+summary|purpose|introduction|overview/im, weight: 2 }
{ pattern: /problem\s+statement|current\s+state/im, weight: 2 }
{ pattern: /value\s+proposition/im, weight: 2 }
{ pattern: /goal|objective|success\s+metric|kpi/im, weight: 2 }
{ pattern: /customer\s+faq|external\s+faq|working\s+backwards/im, weight: 2 }
{ pattern: /proposed\s+solution|solution|core\s+functionality/im, weight: 2 }
{ pattern: /requirement|functional\s+requirement|non.?functional/im, weight: 2 }
{ pattern: /scope|in.scope|out.of.scope/im, weight: 1.5 }
{ pattern: /stakeholder/im, weight: 1.5 }
{ pattern: /timeline|milestone|schedule|roadmap/im, weight: 1 }
{ pattern: /risk|mitigation/im, weight: 1 }
{ pattern: /traceability|requirement\s+mapping/im, weight: 1 }
{ pattern: /open\s+question/im, weight: 1 }
{ pattern: /known\s+unknown|dissenting\s+opinion|unresolved/im, weight: 1 }
```

### VAGUE_LANGUAGE Detection
- qualifiers: easy to use, user-friendly, fast, scalable, intuitive, seamless, robust, efficient
- quantifiers: many, several, some, few, various, numerous
- temporal: soon, quickly, eventually, asap
- weaselWords: should be able to, could potentially, generally, typically
- marketingFluff: best-in-class, world-class, cutting-edge, next-generation
- unquantifiedComparatives: better, faster, improved, enhanced, easier

### STRATEGIC_VIABILITY_PATTERNS
```javascript
leadingIndicator: /leading\s+indicator|predictive|early\s+signal|adoption\s+rate|time\s+to\s+value/gi
counterMetric: /counter[\s-]?metric|guardrail\s+metric|must\s+not\s+degrade/gi
sourceOfTruth: /source\s+of\s+truth|measured\s+(via|in|by)|mixpanel|amplitude|datadog/gi
killSwitch: /kill\s+(switch|criteria)|pivot\s+or\s+persevere|failure\s+criteria/gi
doorType: /one[\s-]?way\s+door|two[\s-]?way\s+door|🚪|🔄/gi
alternativesConsidered: /alternative|rejected\s+approach|we\s+considered/im
dissentingOpinions: /dissenting|known\s+unknown|unresolved\s+debate/im
customerFAQ: /customer\s+faq|external\s+faq|working\s+backwards|aha\s+moment/im
traceability: /traceability|traces?\s+to|fr\d+|nfr\d+|problem\s+id/gi
```

---



# YOUR ADVERSARIAL REVIEW TASK

## SPECIFIC QUESTIONS TO ANSWER

### 1. TAXONOMY ALIGNMENT
Do phase1.md's **14 sections** match what validator.js `REQUIRED_SECTIONS` detects?

| Phase1.md Section | validator.js Pattern | Match? |
|-------------------|---------------------|--------|
| 1. Executive Summary | `executive\s+summary\|purpose\|introduction\|overview` | ? |
| 2. Problem Statement | `problem\s+statement\|current\s+state` | ? |
| 3. Value Proposition | `value\s+proposition` | ? |
| 4. Goals and Objectives | `goal\|objective\|success\s+metric\|kpi` | ? |
| 5. Customer FAQ | `customer\s+faq\|external\s+faq\|working\s+backwards` | ? |
| 6. Proposed Solution | `proposed\s+solution\|solution\|core\s+functionality` | ? |
| 7. Scope | `scope\|in.scope\|out.of.scope` | ? |
| 8. Requirements | `requirement\|functional\s+requirement\|non.?functional` | ? |
| 9. Stakeholders | `stakeholder` | ? |
| 10. Timeline | `timeline\|milestone\|schedule\|roadmap` | ? |
| 11. Risks and Mitigation | `risk\|mitigation` | ? |
| 12. Traceability Summary | `traceability\|requirement\s+mapping` | ? |
| 13. Open Questions | `open\s+question` | ? |
| 14. Known Unknowns & Dissenting Opinions | `known\s+unknown\|dissenting\s+opinion\|unresolved` | ? |

### 2. STRATEGIC VIABILITY PATTERNS
Does validator.js detect ALL the Strategic Viability elements that prompts.js scores for?

| Element | prompts.js Mentions | validator.js Pattern | Detected? |
|---------|---------------------|---------------------|-----------|
| Leading indicators | ✅ 6 pts | `leadingIndicator` | ? |
| Counter-metrics | ✅ 6 pts | `counterMetric` | ? |
| Source of Truth | ✅ 6 pts | `sourceOfTruth` | ? |
| Kill switch | ✅ 5 pts | `killSwitch` | ? |
| Door types (🚪/🔄) | ✅ Calibration | `doorType` | ? |
| Alternatives considered | ✅ Calibration | `alternativesConsidered` | ? |
| Dissenting opinions | ✅ Calibration | `dissentingOpinions` | ? |
| Traceability | ✅ 4 pts | `traceability` | ? |

### 3. PHASE2 vs PROMPTS.JS ALIGNMENT
**CRITICAL:** Phase2.md must use the same **5 dimensions (100 pts total)** as prompts.js.

Verify phase2.md scores on:
1. Document Structure (20 pts) - NOT "Problem Clarity" or other names
2. Requirements Clarity (25 pts)
3. User Focus (20 pts)
4. Technical Quality (15 pts)
5. Strategic Viability (20 pts)

If phase2.md uses different dimension names or weights, scores will mismatch.

### 4. WORKING BACKWARDS ORDER
Phase1.md requires **Customer FAQ BEFORE Proposed Solution**. Does validator.js:
- ✅ Check for this ordering?
- ✅ Reward it in the score?

Look for: `customerFAQIndex < solutionIndex` logic in `scoreDocumentStructure()`

### 5. DOOR TYPE DETECTION
Phase1.md requires **🚪 One-Way** and **🔄 Two-Way** door tagging. Does validator.js:
- ✅ Detect the emoji patterns?
- ✅ Detect the text patterns ("one-way door", "two-way door")?

Look for: `doorType` pattern includes `🚪|🔄`

### 6. ACCEPTANCE CRITERIA QUALITY
Phase1.md requires BOTH **success AND failure** ACs. Does validator.js:
- ✅ Detect Given/When/Then format?
- ✅ Specifically check for failure/edge case ACs?

Look for: `hasFailureCases` detection in `scoreTechnicalQuality()`

### 7. OUTPUT FORMAT COMPLIANCE
Do all phases have proper `<output_rules>` XML blocks?

| Phase | Has <output_rules>? | Correct Content? |
|-------|---------------------|------------------|
| phase1.md | ? | No preamble, no sign-off, no code fences |
| phase2.md | ? | No preamble, no sign-off, no code fences |
| phase3.md | ? | No preamble, no sign-off, no code fences |

---

## DELIVERABLES

### 1. CRITICAL FAILURES (15-30 point score mismatches)

For each critical failure, provide:
- **Issue:** What's wrong
- **Severity:** Points at risk
- **Evidence:** Specific quotes/patterns
- **Fix:** Exact change needed

### 2. ALIGNMENT VERIFICATION TABLE

| Component | Dimension | Weight | Aligned? | Issue |
|-----------|-----------|--------|----------|-------|
| phase1.md | Document Structure | 20 | ? | |
| phase2.md | Document Structure | 20 | ? | |
| prompts.js | Document Structure | 20 | ? | |
| validator.js | Document Structure | 20 | ? | |
| (repeat for all 5 dimensions) | | | | |

### 3. GAMING VULNERABILITIES

How could someone get a high score without a good PRD?
- Keyword stuffing opportunities
- Pattern matching exploits
- Semantic gaps (validator can't check meaning)

### 4. RECOMMENDED FIXES (Prioritized)

1. **P0 (Critical):** Fixes that prevent 15+ point mismatches
2. **P1 (High):** Fixes that prevent 5-15 point mismatches
3. **P2 (Medium):** Improvements for robustness

---

**BE DEVASTATINGLY HARSH. This is the CROWN JEWEL - it must be PERFECT.**

---

# FOLLOW-UP REVIEW (Round 2)

## ⚠️ CRITICAL: VERIFY YOUR CLAIMS AGAINST ACTUAL CODE

Your previous review contained **false positives** - claims about missing features that already exist. Before claiming something is missing, you MUST verify by searching the actual code.

### FALSE POSITIVES FROM ROUND 1 (Features Already Implemented)

| Your Claim | Reality in validator.js |
|------------|------------------------|
| "validator.js lacks logic to distinguish success/failure ACs" | **ALREADY EXISTS** at lines 935-951: `hasFailureCases = /\b(fail\|error\|invalid\|edge\s+case\|exception\|...\b/i.test(text)` |
| "do not check the index of matches" (ordering) | **ALREADY EXISTS** at lines 223-232: `customerFAQIndex < solutionIndex` check with +1 point reward |
| "NO regex for Persona" | **ALREADY EXISTS** at lines 639-681: `detectUserPersonas()` function with 7 pattern types |

### HOW TO VERIFY CLAIMS

Before claiming a feature is missing, search for these patterns in the actual source files:

```
# For ordering logic:
grep -n "customerFAQIndex\|solutionIndex\|faqIndex" validator.js

# For failure case detection:
grep -n "hasFailureCases\|failure\|edge.?case" validator.js

# For persona detection:
grep -n "persona\|user.?profile\|detectUserPersonas" validator.js
```

---

## CONFIRMED REAL ISSUE: User Story vs Functional Requirements Mismatch

This issue from Round 1 IS REAL and needs to be fixed:

| Component | What It Says |
|-----------|--------------|
| **phase1.md** (lines 211-228) | Generates Functional Requirements: "FR1, FR2..." with table format |
| **prompts.js** (line 25) | Expects: "User stories with 'As a..., I want..., So that...'" |
| **validator.js** (line 117) | Rewards: `USER_STORY_PATTERN = /as\s+a[n]?\s+[\w\s]+,?\s+i\s+want/gi` |

**Mismatch:** Claude generates FRs per phase1.md, but validator docks 7 points for missing user stories.

---

## YOUR ROUND 2 TASK

### 1. VERIFY BEFORE CLAIMING

For EACH issue you report, provide:
- **File:** Exact filename
- **Search:** What you searched for
- **Result:** What you found (or didn't find)
- **Line numbers:** Where the code exists (or should exist)

### 2. FIND NEW ISSUES (Not Already Reported)

Focus on issues NOT covered by:
- ✅ Success/failure AC detection (already exists)
- ✅ Customer FAQ ordering (already exists)
- ✅ Persona detection (already exists)
- ✅ User Story vs FR mismatch (already confirmed)

### 3. GAMING VULNERABILITIES (Semantic Gaps)

Focus on exploits that WORK despite existing detection:

| Vulnerability | Why It Works |
|---------------|--------------|
| **Keyword stuffing** | "Leading Indicator: TBD" triggers pattern but provides no value |
| **Emoji spam** | Pasting 🚪🔄 without categorizing requirements |
| **Formula mirage** | "X = A + B" where A and B are undefined |
| **Section headers only** | "## Customer FAQ" with empty content |

### 4. ALIGNMENT DELTA ANALYSIS

For each component pair, identify EXACTLY what one says that the other doesn't:

| prompts.js Says | validator.js Checks | Gap? |
|-----------------|---------------------|------|
| "User stories with As a..." (7 pts) | `USER_STORY_PATTERN` regex | ✅ Aligned |
| "MoSCoW prioritization" (5 pts) | `PRIORITIZATION_PATTERNS.moscow` | ✅ Aligned |
| "Scope Realism" (5 pts) | ? | **CHECK THIS** |
| "Risk Quality" (5 pts) | ? | **CHECK THIS** |

---

## DELIVERABLES (Round 2)

### 1. VERIFIED ISSUES ONLY

For each issue:
```
**Issue:** [Description]
**Evidence:** [File:line - exact quote from code]
**Verification:** [Command you used to verify]
**Severity:** [X pts at risk]
**Fix:** [Specific code change]
```

### 2. GAMING EXPLOIT PROOF-OF-CONCEPT

For each gaming vulnerability, show a minimal PRD snippet that would:
- Score highly on the validator
- Be obviously low-quality to a human reader

### 3. PRIORITIZED ACTION ITEMS

| Priority | Issue | Points at Risk | Fix Complexity |
|----------|-------|----------------|----------------|
| P0 | User Story vs FR mismatch | 7 pts | Update prompts.js or phase1.md |
| P1 | [Your finding] | X pts | [Fix] |
| P2 | [Your finding] | X pts | [Fix] |

---

**DO NOT REPEAT FALSE POSITIVES. VERIFY EVERY CLAIM. EVIDENCE BEFORE ASSERTIONS.**
