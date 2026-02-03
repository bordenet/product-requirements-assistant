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

### 1. Document Structure (25 points)
- **Core Sections (12 pts)**: Purpose/Introduction, User Personas, Features/Requirements, Success Metrics, Scope, Timeline, Risks/Dependencies, Constraints
- **Organization (7 pts)**: Logical flow, heading hierarchy, related content grouped
- **Formatting (4 pts)**: Consistent bullets, tables for structured data
- **Scope Boundaries (2 pts)**: Explicit "In Scope" AND "Out of Scope" definitions

### 2. Requirements Clarity (30 points)
- **Precision (8 pts)**: No vague qualifiers, weasel words, or marketing fluff
- **Completeness (8 pts)**: User stories with "As a..., I want..., So that..." format
- **Measurability (8 pts)**: Specific numbers, percentages, timeframes, or counts
- **Prioritization (6 pts)**: MoSCoW (Must/Should/Could/Won't), P0/P1/P2, or explicit priority ranking

### 3. User Focus (25 points)
- **User Personas (7 pts)**: Detailed descriptions of who uses the product, their roles, needs
- **Problem Statement (7 pts)**: Clear problem definition, value proposition, "why" behind the product
- **Alignment (6 pts)**: Requirements trace back to user needs, features serve identified personas
- **Customer Evidence (5 pts)**: User research, interview quotes, analytics data, or feedback cited

### 4. Technical Quality (20 points)
- **Non-Functional Requirements (7 pts)**: Performance, security, reliability, scalability, compliance
- **Acceptance Criteria (7 pts)**: Testable conditions in Given/When/Then format
- **Dependencies/Constraints (6 pts)**: Risks, assumptions, blockers documented

## CALIBRATION GUIDANCE
- Be HARSH. Most PRDs score 40-60. Only exceptional PRDs score 80+.
- A score of 70+ means ready for development handoff.
- Deduct points for EVERY vague qualifier without metrics.
- Deduct points for weasel words ("should be able to", "might", "could potentially").
- Deduct points for marketing fluff ("best-in-class", "cutting-edge", "world-class").
- Reward explicit prioritization (MoSCoW preferred).
- Reward customer quotes and research citations.
- Deduct points for features without clear user benefit.
- Deduct points for missing required sections.

## PRD TO EVALUATE

\`\`\`
${prdContent}
\`\`\`

## REQUIRED OUTPUT FORMAT

Provide your evaluation in this exact format:

**TOTAL SCORE: [X]/100**

### Document Structure: [X]/25
[2-3 sentence justification]

### Requirements Clarity: [X]/30
[2-3 sentence justification]

### User Focus: [X]/25
[2-3 sentence justification]

### Technical Quality: [X]/20
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
    ...(currentResult.technical?.issues || [])
  ].slice(0, 5).map(i => `- ${i}`).join('\n');

  return `You are a senior Product Manager providing detailed feedback on a PRD.

## CURRENT VALIDATION RESULTS
Total Score: ${currentResult.totalScore}/100
- Document Structure: ${currentResult.structure?.score || 0}/25
- Requirements Clarity: ${currentResult.clarity?.score || 0}/30
- User Focus: ${currentResult.userFocus?.score || 0}/25
- Technical Quality: ${currentResult.technical?.score || 0}/20

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
1. Has all required sections (Purpose, User Personas, Features, Success Metrics, Scope, Timeline, Risks, Constraints)
2. Includes explicit "In Scope" AND "Out of Scope" definitions
3. Uses user story format: "As a [user], I want [feature] so that [benefit]"
4. Uses MoSCoW prioritization (Must have, Should have, Could have, Won't have) or P0/P1/P2 labels
5. Includes measurable acceptance criteria in Given/When/Then format
6. Has specific metrics (numbers, percentages, timeframes)
7. Cites customer evidence (user research, interview quotes, analytics data, or feedback)
8. Addresses non-functional requirements (performance, security, reliability)
9. Documents dependencies, assumptions, and constraints
10. Avoids vague qualifiers, weasel words, and marketing fluff

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
