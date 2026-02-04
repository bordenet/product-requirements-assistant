/**
 * Inline PRD Validator for Assistant UI
 * @module validator-inline
 *
 * This is a lightweight copy of the core validation logic from the validator tool.
 * It enables inline PRD scoring directly in the assistant after Phase 3 completion.
 */

// Required sections detection patterns - supports numbered headers (e.g., "1.1 Purpose")
const REQUIRED_SECTIONS = [
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(purpose|introduction|overview|objective|executive\s+summary)/im, name: 'Purpose/Introduction', weight: 2 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(user\s*persona|personas?|audience|target\s+user|customer\s+profile)/im, name: 'User Personas', weight: 2 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(feature|requirement|user\s+stor|functional)/im, name: 'Features/Requirements', weight: 2 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(success|metric|kpi|measure)/im, name: 'Success Metrics', weight: 2 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(scope|out.of.scope|boundary|boundaries)/im, name: 'Scope Definition', weight: 1 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(timeline|milestone|schedule|roadmap|phase)/im, name: 'Timeline/Milestones', weight: 1 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(risk|dependency|dependencies|assumption)/im, name: 'Risks/Dependencies', weight: 1 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(constraint|limitation)/im, name: 'Constraints', weight: 1 }
];

// Vague language patterns
const VAGUE_QUALIFIERS = [
  'easy to use', 'user-friendly', 'fast', 'quick', 'responsive',
  'good performance', 'high quality', 'scalable', 'flexible',
  'intuitive', 'seamless', 'robust', 'efficient', 'optimal',
  'minimal', 'sufficient', 'reasonable', 'appropriate', 'adequate'
];

// Patterns for requirements quality
const USER_STORY_PATTERN = /as\s+a[n]?\s+[\w\s]+,?\s+i\s+want/gi;
// Accept both inline and markdown bold Given/When/Then
const ACCEPTANCE_CRITERIA_PATTERN = /(?:\*\*)?given(?:\*\*)?\s+.+?(?:\*\*)?when(?:\*\*)?\s+.+?(?:\*\*)?then(?:\*\*)?\s+/gi;
const AC_KEYWORD_PATTERN = /-\s*\*\*Given\*\*/gi;
// Expanded measurable pattern with comparison operators and more units
const MEASURABLE_PATTERN = /(?:≤|≥|<|>|=)?\s*\d+(?:\.\d+)?\s*(ms|millisecond|second|minute|hour|day|week|%|percent|\$|dollar|user|request|transaction|item|task|point|pt)/gi;

// MoSCoW prioritization patterns
const MOSCOW_PATTERN = /\b(must have|should have|could have|won't have|must-have|should-have|could-have|won't-have)\b/gi;
const P_LEVEL_PATTERN = /\b(p0|p1|p2|p3|priority\s*[0-3]|priority:\s*(high|medium|low|critical))\b/gi;

/**
 * Score document structure (25 pts max)
 */
function scoreDocumentStructure(text) {
  let score = 0;
  const issues = [];

  // Check required sections (12 pts max)
  let sectionScore = 0;
  for (const section of REQUIRED_SECTIONS) {
    if (section.pattern.test(text)) {
      sectionScore += section.weight;
    } else {
      issues.push(`Missing: ${section.name}`);
    }
  }
  score += Math.min(12, sectionScore);

  // Organization (7 pts) - check for consistent heading hierarchy
  const headings = text.match(/^#+\s+/gm) || [];
  if (headings.length >= 5) score += 4;
  else if (headings.length >= 3) score += 2;

  // Check for logical flow with multiple heading levels
  const hasH1 = /^#\s+/m.test(text);
  const hasH2 = /^##\s+/m.test(text);
  if (hasH1 && hasH2) score += 3;
  else if (hasH1 || hasH2) score += 1;

  // Formatting (4 pts) - bullets and tables
  const hasBullets = /^[\s]*[-*]\s+/m.test(text);
  const hasTables = /\|.*\|/.test(text);
  if (hasBullets) score += 2;
  if (hasTables) score += 2;

  // Scope boundaries (2 pts)
  const hasInScope = /\b(in.scope|included|within scope)\b/i.test(text);
  const hasOutOfScope = /\b(out.of.scope|not included|excluded|won't)\b/i.test(text);
  if (hasInScope && hasOutOfScope) score += 2;
  else if (hasInScope || hasOutOfScope) score += 1;

  return { score: Math.min(25, score), maxScore: 25, issues };
}

/**
 * Score requirements clarity (30 pts max)
 */
function scoreRequirementsClarity(text) {
  let score = 0;
  const issues = [];
  const lowerText = text.toLowerCase();

  // Precision (8 pts) - penalize vague qualifiers
  let vagueCount = 0;
  for (const qualifier of VAGUE_QUALIFIERS) {
    if (lowerText.includes(qualifier)) vagueCount++;
  }
  if (vagueCount === 0) score += 8;
  else if (vagueCount <= 2) score += 6;
  else if (vagueCount <= 5) score += 4;
  else {
    score += 2;
    issues.push(`Found ${vagueCount} vague qualifiers`);
  }

  // Completeness (8 pts) - user stories
  const userStoryCount = (text.match(USER_STORY_PATTERN) || []).length;
  if (userStoryCount >= 3) score += 8;
  else if (userStoryCount >= 1) score += 5;
  else issues.push('No user stories found');

  // Measurability (8 pts)
  const measurableCount = (text.match(MEASURABLE_PATTERN) || []).length;
  if (measurableCount >= 5) score += 8;
  else if (measurableCount >= 2) score += 5;
  else if (measurableCount >= 1) score += 2;
  else issues.push('No measurable requirements');

  // Prioritization (6 pts)
  const hasMoscow = MOSCOW_PATTERN.test(text);
  const hasPLevel = P_LEVEL_PATTERN.test(text);
  if (hasMoscow || hasPLevel) score += 6;
  else issues.push('No prioritization (MoSCoW or P0/P1/P2)');

  return { score: Math.min(30, score), maxScore: 30, issues };
}

/**
 * Score user focus (25 pts max)
 */
function scoreUserFocus(text) {
  let score = 0;
  const issues = [];

  // User Personas (7 pts) - supports numbered headers
  const hasPersonaSection = /^#+\s*(\d+\.?\d*\.?\s*)?(user\s*persona|personas?|target\s+user|audience|customer\s+profile)/im.test(text);
  if (hasPersonaSection) score += 7;
  else issues.push('No user personas section');

  // Problem Statement (7 pts) - supports numbered headers
  const hasProblemSection = /^#+\s*(\d+\.?\d*\.?\s*)?(problem|goal|objective|why|motivation|current\s+state|target\s+state)/im.test(text);
  if (hasProblemSection) score += 7;
  else issues.push('No problem statement');

  // Alignment (6 pts) - check if requirements reference users
  const userRefs = (text.match(/\b(user|customer|persona)\b/gi) || []).length;
  if (userRefs >= 10) score += 6;
  else if (userRefs >= 5) score += 4;
  else if (userRefs >= 2) score += 2;

  // Customer Evidence (5 pts)
  const hasResearch = /\b(user research|customer research|user interview|survey result)\b/i.test(text);
  const hasQuotes = /"[^"]{10,}"/.test(text);
  if (hasResearch || hasQuotes) score += 5;

  return { score: Math.min(25, score), maxScore: 25, issues };
}

/**
 * Score technical quality (20 pts max)
 */
function scoreTechnicalQuality(text) {
  let score = 0;
  const issues = [];

  // Non-functional requirements (7 pts)
  const nfrPatterns = [
    /\b(performance|latency|response.?time)\b/i,
    /\b(security|authentication|authorization)\b/i,
    /\b(reliability|availability|uptime)\b/i,
    /\b(scalability|capacity)\b/i
  ];
  let nfrCount = nfrPatterns.filter(p => p.test(text)).length;
  score += Math.min(7, nfrCount * 2);
  if (nfrCount === 0) issues.push('No non-functional requirements');

  // Acceptance criteria (7 pts) - detect both inline and bullet-point formats
  const inlineAC = (text.match(ACCEPTANCE_CRITERIA_PATTERN) || []).length;
  const bulletAC = (text.match(AC_KEYWORD_PATTERN) || []).length;
  const acCount = Math.max(inlineAC, bulletAC);
  if (acCount >= 3) score += 7;
  else if (acCount >= 1) score += 4;
  else issues.push('No Given/When/Then acceptance criteria');

  // Dependencies & constraints (6 pts)
  const hasDeps = /^#+\s*(risk|dependency|dependencies|assumption|constraint)/im.test(text);
  if (hasDeps) score += 6;
  else issues.push('No dependencies/constraints section');

  return { score: Math.min(20, score), maxScore: 20, issues };
}

/**
 * Validate a PRD and return comprehensive scoring results
 * @param {string} text - PRD content
 * @returns {Object} Complete validation results
 */
export function validatePRD(text) {
  if (!text || typeof text !== 'string' || text.trim().length < 50) {
    return {
      totalScore: 0,
      structure: { score: 0, maxScore: 25, issues: ['No content to validate'] },
      clarity: { score: 0, maxScore: 30, issues: ['No content to validate'] },
      userFocus: { score: 0, maxScore: 25, issues: ['No content to validate'] },
      technical: { score: 0, maxScore: 20, issues: ['No content to validate'] }
    };
  }

  const structure = scoreDocumentStructure(text);
  const clarity = scoreRequirementsClarity(text);
  const userFocus = scoreUserFocus(text);
  const technical = scoreTechnicalQuality(text);

  const totalScore = structure.score + clarity.score + userFocus.score + technical.score;

  return {
    totalScore,
    structure,
    clarity,
    userFocus,
    technical
  };
}

/**
 * Get score color based on value
 * @param {number} score - Score value (0-100)
 * @returns {string} Tailwind color class
 */
export function getScoreColor(score) {
  if (score >= 70) return 'green';
  if (score >= 50) return 'yellow';
  if (score >= 30) return 'orange';
  return 'red';
}

/**
 * Get score label based on value
 * @param {number} score - Score value (0-100)
 * @returns {string} Human-readable label
 */
export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Ready for Dev';
  if (score >= 50) return 'Needs Work';
  if (score >= 30) return 'Draft Quality';
  return 'Incomplete';
}
