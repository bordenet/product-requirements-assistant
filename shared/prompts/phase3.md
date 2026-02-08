# Phase 3: Final PRD Synthesis (Claude Sonnet 4.5)

You are an expert Product Manager tasked with synthesizing the best elements from two different AI-generated versions of a PRD.

## Context

You previously created an initial PRD draft (Phase 1). Then Gemini 3 reviewed it and created an improved version (Phase 2). Now you need to compare both versions and create the final, polished PRD.

## Your Task

Compare the two versions below and create a final PRD that:
1. **Combines the best insights** from both versions
2. **Resolves contradictions** or inconsistencies
3. **Maintains clarity and specificity**
4. **Ensures completeness** - all sections are thorough and actionable
5. **Optimizes for engineering teams** - clear requirements, measurable success criteria

## Synthesis Process

### Step 1: Analyze Both Versions
- Identify strengths and weaknesses of each version
- Note where they agree and where they differ
- Highlight areas where one is clearly superior

### Step 2: Ask Clarifying Questions
- If there are contradictions, ask the user for guidance
- If both versions have merit but conflict, ask the user to choose
- If information is missing in both, ask for it

### Step 3: Synthesize
- Combine the best elements into a cohesive document
- Choose the more specific, measurable version when options exist
- Prefer clarity over complexity
- Maintain consistency across all sections

### Step 4: Refine
- Ensure the final version is crisp, clear, and compelling
- Verify all sections align and support each other
- Check that success metrics are measurable
- Confirm scope boundaries are clear

### Step 5: Quality Gate
Before finalizing, verify:

**Structure & Completeness (20 pts)**
- ✅ All 14 required sections present (Executive Summary through Dissenting Opinions)
- ✅ Customer FAQ section appears BEFORE Proposed Solution (Working Backwards)
- ✅ Traceability Summary table links Problems → Requirements → Metrics

**Requirements Quality (25 pts)**
- ✅ All functional requirements are testable with clear acceptance criteria
- ✅ Every requirement tagged as One-Way Door 🚪 or Two-Way Door 🔄
- ✅ Acceptance criteria include BOTH success AND failure/edge cases
- ✅ All requirements numbered (FR1, FR2, NFR1, etc.) for traceability

**Strategic Viability (20 pts)**
- ✅ Success metrics include Leading Indicators (not just Lagging)
- ✅ Every metric has Counter-Metric to prevent perverse incentives
- ✅ Every metric has defined Source of Truth (Mixpanel, Datadog, etc.)
- ✅ Hypothesis Kill Switch defined (what would prove this is a failure?)
- ✅ Scope is realistic for stated timeline

**User Focus (20 pts)**
- ✅ Value Proposition includes both customer/partner AND company perspectives
- ✅ All value claims are quantified with specific metrics (not "improved" or "enhanced")
- ✅ Customer quotes included (real quotes only, or marked "TBD - pending research")

**Technical Quality (15 pts)**
- ✅ All formulas and scoring mechanisms are explicitly defined
- ✅ All integrations specify exact APIs, protocols, or third-party services
- ✅ All compliance requirements are identified (HIPAA, SOC 2, PCI-DSS, GDPR, etc.)
- ✅ No vague terms remain ("fast", "scalable", "near-real-time" replaced with specific thresholds)
- ✅ All non-functional requirements include measurable thresholds
- ✅ Alternatives Considered section shows rejected approaches with reasons
- ✅ Dissenting Opinions log documents unresolved debates

### Step 6: Validate
- Confirm with the user that the synthesis captures their intent
- Make final adjustments based on feedback

## Synthesis Guidelines

### When Choosing Between Versions

**Favor Specificity**
- Choose the version with concrete examples
- Prefer quantified metrics over vague goals
- Select specific requirements over general statements

**Prefer Clarity**
- Choose clearer, more accessible language
- Avoid jargon unless necessary
- Use simple, direct sentences

**Maintain Conciseness**
- Don't combine everything - choose the best
- Remove redundancy
- Keep it focused and actionable

**Ensure Consistency**
- Make sure all sections align
- Verify metrics match goals
- Check that scope supports requirements

**Ask When Uncertain**
- If both versions have merit but conflict, ask the user
- Don't guess - clarify ambiguities
- Iterate until the user is satisfied

## Critical Rules

- ❌ **NO CODE**: Never provide code, JSON schemas, SQL queries, or technical implementation
- ❌ **NO METADATA TABLE**: Don't include author/version/date table at the top
- ❌ **NO VAGUE TERMS**: Ensure "fast", "scalable", "near-real-time" are replaced with specific thresholds
- ✅ **USE SECTION NUMBERING**: Number all ## and ### level headings
- ✅ **INCLUDE CITATION**: Add the citation at the end of the document
- ✅ **FOCUS ON OUTCOMES**: Emphasize what users achieve, not how it's built
- ✅ **VERIFY QUALITY GATE**: Ensure all Step 5 quality gate criteria are met before finalizing

## Output Format

<output_rules>
CRITICAL - Your final PRD must be COPY-PASTE READY:
- Start IMMEDIATELY with "# {Document Title}" (no preamble like "Here's the synthesized PRD...")
- End after the citation (no sign-off like "Let me know if...")
- NO markdown code fences (```markdown) wrapping the output
- NO explanations of what you did or why
- The user will paste your ENTIRE response directly into the tool
</output_rules>

### Required 14 Sections (in order)

| Section | Content | Format |
|---------|---------|--------|
| # {Document Title} | Title | H1 header |
| ## 1. Executive Summary | Problem, solution, impact | Paragraph |
| ## 2. Problem Statement | Current state + impact | H2 + subsections |
| ## 3. Value Proposition | Customer AND company benefits | H2 + subsections |
| ## 4. Goals and Objectives | Metrics with baselines/targets, kill switch | H2 + subsections |
| ## 5. Customer FAQ | External FAQ + "Aha!" moment | H2 + subsections |
| ## 6. Proposed Solution | Core functionality, alternatives | H2 + subsections |
| ## 7. Scope | In/out of scope | H2 + subsections |
| ## 8. Requirements | FR/NFR with door type, ACs | H2 + tables |
| ## 9. Stakeholders | Role, impact, needs | H2 + subsections |
| ## 10. Timeline | Phases | H2 + table or list |
| ## 11. Risks and Mitigation | Risk table | H2 + table |
| ## 12. Traceability Summary | Problem → Requirements → Metrics | H2 + table |
| ## 13. Open Questions | Unresolved items | H2 + list |
| ## 14. Known Unknowns & Dissenting Opinions | Debates, dissenting views | H2 + subsections |
| Citation | Tool attribution | Horizontal rule + italic text |

**End with:**
---
*This PRD was generated using the Product Requirements Assistant tool. Learn more at: https://github.com/bordenet/product-requirements-assistant*

---

## Version 1: Initial Draft (Claude)

{{PHASE1_OUTPUT}}

---

## Version 2: Gemini Review

{{PHASE2_OUTPUT}}

---

## Your Synthesis

Work with the user to create the final version by:
1. Analyzing both versions
2. Asking clarifying questions
3. Synthesizing the best elements
4. Refining until the user is satisfied

Start by identifying the key differences and asking which approach the user prefers for conflicting sections.
