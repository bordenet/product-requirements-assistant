/**
 * Prompt generation for LLM-based PRD scoring
 */

/**
 * Generate comprehensive LLM scoring prompt
 * @param {string} prdContent - The PRD content to score
 * @returns {string} Complete prompt for LLM scoring
 */
export function generateLLMScoringPrompt(prdContent) {
  return `You are an expert Product Manager evaluating a Product Requirements Document (PRD).

Score this PRD using the following rubric (0-100 points total):

## SCORING RUBRIC

### 1. Document Structure (20 points)
- **Core Sections (10 pts)**: All 14 required sections present (Executive Summary through Dissenting Opinions)
- **Organization (5 pts)**: Logical flow, heading hierarchy, Customer FAQ BEFORE Proposed Solution
- **Formatting (3 pts)**: Consistent bullets, tables for structured data
- **Scope Boundaries (2 pts)**: Explicit "In Scope" AND "Out of Scope" definitions

### 2. Requirements Clarity (25 points)
- **Precision (7 pts)**: No vague qualifiers, weasel words, or marketing fluff
- **Completeness (7 pts)**: Functional Requirements with ID (FR1, FR2), Problem Link, Door Type, and Acceptance Criteria
- **Measurability (6 pts)**: Specific numbers, percentages, timeframes, or counts
- **Prioritization (5 pts)**: MoSCoW (Must/Should/Could/Won't), P0/P1/P2, or explicit priority ranking

### 3. User Focus (20 points)
- **User Personas (5 pts)**: Detailed descriptions of who uses the product, their roles, needs
- **Problem Statement (5 pts)**: Clear problem definition, value proposition, "why" behind the product
- **Alignment (5 pts)**: Requirements trace back to user needs, features serve identified personas
- **Customer Evidence (5 pts)**: User research, interview quotes, Customer FAQ, "Aha!" moment quote

### 4. Technical Quality (15 points)
- **Non-Functional Requirements (5 pts)**: Performance, security, reliability, scalability, compliance
- **Acceptance Criteria (5 pts)**: Given/When/Then for BOTH success AND failure/edge cases
- **Dependencies/Constraints (5 pts)**: Risks, assumptions, blockers documented

### 5. Strategic Viability (20 points) ⭐ NEW
- **Metric Validity (6 pts)**: Leading indicators present, counter-metrics defined, Source of Truth specified
- **Scope Realism (5 pts)**: Scope is achievable within stated timeline (not a "Kitchen Sink" PRD)
- **Risk & Mitigation Quality (5 pts)**: Risks are specific (not generic "we might run late"), mitigations are actionable
- **Traceability (4 pts)**: Every requirement traces to a Problem ID, every problem has a Metric ID

## CALIBRATION GUIDANCE
- Be HARSH. Most PRDs score 40-60. Only exceptional PRDs score 80+.
- A score of 70+ means ready for development handoff.
- Deduct points for EVERY vague qualifier without metrics.
- Deduct points for weasel words ("should be able to", "might", "could potentially").
- Deduct points for marketing fluff ("best-in-class", "cutting-edge", "world-class").
- Reward explicit prioritization (MoSCoW preferred).
- Reward customer quotes and Customer FAQ (Working Backwards).
- Deduct points for features without clear user benefit.
- Deduct points for missing required sections.
- Deduct points for missing Traceability Summary.
- Deduct points for all requirements tagged "P0" (no real prioritization).
- Deduct points for metrics without Source of Truth.
- Reward One-Way/Two-Way Door tagging.
- Reward Hypothesis Kill Switch definition.
- Reward Alternatives Considered with reasons.
- Reward Dissenting Opinions log.

## PRD TO EVALUATE

\`\`\`
${prdContent}
\`\`\`

## REQUIRED OUTPUT FORMAT

Provide your evaluation in this exact format:

**TOTAL SCORE: [X]/100**

### Document Structure: [X]/20
[2-3 sentence justification]

### Requirements Clarity: [X]/25
[2-3 sentence justification]

### User Focus: [X]/20
[2-3 sentence justification]

### Technical Quality: [X]/15
[2-3 sentence justification]

### Strategic Viability: [X]/20
[2-3 sentence justification]

### Top 3 Issues
1. [Most critical issue]
2. [Second issue]
3. [Third issue]

### Top 3 Strengths
1. [Strongest aspect]
2. [Second strength]
3. [Third strength]`;
}

/**
 * Generate critique prompt for detailed feedback
 * @param {string} prdContent - The PRD content to critique
 * @param {Object} currentResult - Current validation results
 * @returns {string} Complete prompt for critique
 */
export function generateCritiquePrompt(prdContent, currentResult) {
  const issuesList = [
    ...(currentResult.structure?.issues || []),
    ...(currentResult.clarity?.issues || []),
    ...(currentResult.userFocus?.issues || []),
    ...(currentResult.technical?.issues || []),
    ...(currentResult.strategicViability?.issues || [])
  ].slice(0, 5).map(i => `- ${i}`).join('\n');

  return `You are a senior Product Manager providing detailed feedback on a PRD.

## CURRENT VALIDATION RESULTS
Total Score: ${currentResult.totalScore}/100
- Document Structure: ${currentResult.structure?.score || 0}/20
- Requirements Clarity: ${currentResult.clarity?.score || 0}/25
- User Focus: ${currentResult.userFocus?.score || 0}/20
- Technical Quality: ${currentResult.technical?.score || 0}/15
- Strategic Viability: ${currentResult.strategicViability?.score || 0}/20

Key issues detected:
${issuesList || '- None detected by automated scan'}

## PRD TO CRITIQUE

\`\`\`
${prdContent}
\`\`\`

## YOUR TASK

Provide:
1. **Executive Summary** (2-3 sentences on overall PRD quality)
2. **Detailed Critique** by section:
   - What works well
   - What needs improvement
   - Specific suggestions with examples
3. **Revised PRD** - A complete rewrite addressing all issues

Be specific. Show exact rewrites. Make the document ready for development handoff.`;
}

/**
 * Generate rewrite prompt
 * @param {string} prdContent - The PRD content to rewrite
 * @param {Object} currentResult - Current validation results
 * @returns {string} Complete prompt for rewrite
 */
export function generateRewritePrompt(prdContent, currentResult) {
  return `You are a senior Product Manager rewriting a PRD to achieve a score of 85+.

## CURRENT SCORE: ${currentResult.totalScore}/100

## ORIGINAL PRD

\`\`\`
${prdContent}
\`\`\`

## REWRITE REQUIREMENTS

Create a complete, polished PRD that:
1. Has all required sections (Executive Summary, Problem Statement, Value Proposition, Goals, Customer FAQ, Proposed Solution, Scope, Requirements, Stakeholders, Timeline, Risks, Traceability, Open Questions, Dissenting Opinions)
2. Includes explicit "In Scope" AND "Out of Scope" definitions
3. Uses FR format: "FR1: [Requirement] | Problem Link: P1 | Door Type: 🚪/🔄 | AC: [success AND failure cases]"
4. Uses MoSCoW prioritization (Must have, Should have, Could have, Won't have) or P0/P1/P2 labels
5. Includes measurable acceptance criteria for BOTH success AND failure/edge cases
6. Has specific metrics with Leading/Lagging type, Baseline, Target, Source of Truth, and Counter-Metric
7. Cites customer evidence (user research, interview quotes, Customer FAQ, "Aha!" moment quote)
8. Addresses non-functional requirements (performance, security, reliability, scalability)
9. Documents dependencies, assumptions, risks with specific mitigations
10. Avoids vague qualifiers, weasel words, and marketing fluff
11. Includes Hypothesis Kill Switch (what data would prove this feature is a failure?)
12. Includes Traceability Summary (Problem → Requirements → Metrics mapping)

Output ONLY the rewritten PRD in markdown format. No commentary.`;
}

/**
 * Clean AI response to extract markdown content
 * @param {string} response - Raw AI response
 * @returns {string} Cleaned markdown content
 */
export function cleanAIResponse(response) {
  // Remove common prefixes
  let cleaned = response.replace(/^(Here's|Here is|I've|I have|Below is)[^:]*:\s*/i, '');

  // Extract content from markdown code blocks if present
  const codeBlockMatch = cleaned.match(/```(?:markdown)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1];
  }

  return cleaned.trim();
}
