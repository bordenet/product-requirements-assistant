/**
 * PRD Validator - Scoring Logic
 *
 * Scoring Dimensions:
 * 1. Document Structure (25 pts) - Section presence, organization, formatting
 * 2. Requirements Clarity (30 pts) - Precision, completeness, consistency
 * 3. User Focus (25 pts) - Personas, problem statement, alignment
 * 4. Technical Quality (20 pts) - Non-functional reqs, acceptance criteria, traceability
 */

import { getSlopPenalty, calculateSlopScore } from './slop-detection.js';

// ============================================================================
// Constants
// ============================================================================

// Section patterns support both direct headers and numbered headers (e.g., "1.1 Purpose", "## Purpose")
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

const VAGUE_QUALIFIERS = [
  'easy to use', 'user-friendly', 'fast', 'quick', 'responsive',
  'good performance', 'high quality', 'scalable', 'flexible',
  'intuitive', 'seamless', 'robust', 'efficient', 'optimal',
  'minimal', 'sufficient', 'reasonable', 'appropriate', 'adequate'
];

// Enhanced vague language detection - categorized for better feedback
const VAGUE_LANGUAGE = {
  qualifiers: [
    'easy to use', 'user-friendly', 'fast', 'quick', 'responsive',
    'good performance', 'high quality', 'scalable', 'flexible',
    'intuitive', 'seamless', 'robust', 'efficient', 'optimal',
    'minimal', 'sufficient', 'reasonable', 'appropriate', 'adequate'
  ],
  quantifiers: [
    'many', 'several', 'some', 'few', 'various', 'numerous', 'multiple',
    'a lot', 'a number of', 'a bit', 'a little'
  ],
  temporal: [
    'soon', 'quickly', 'rapidly', 'promptly', 'eventually', 'in the future',
    'as soon as possible', 'asap', 'shortly', 'in due time'
  ],
  // Note: "may", "might", "possibly" removed - legitimate in risks/assumptions sections
  weaselWords: [
    'should be able to', 'could potentially',
    'generally', 'typically', 'usually', 'often', 'sometimes'
  ],
  marketingFluff: [
    'best-in-class', 'world-class', 'cutting-edge', 'next-generation',
    'state-of-the-art', 'industry-leading', 'innovative', 'revolutionary'
  ],
  unquantifiedComparatives: [
    'better', 'faster', 'more efficient', 'improved', 'enhanced',
    'easier', 'simpler', 'cheaper', 'superior', 'optimized'
  ]
};

// Prioritization detection patterns
const PRIORITIZATION_PATTERNS = {
  // MoSCoW requires the full phrase with "have" to avoid false positives
  moscow: /\b(must have|should have|could have|won't have|must-have|should-have|could-have|won't-have)\b/gi,
  pLevel: /\b(p0|p1|p2|p3|priority\s*[0-3]|priority:\s*(high|medium|low|critical))\b/gi,
  numbered: /\b(priority|pri|importance):\s*\d/gi,
  tiered: /\b(tier\s*[1-3]|phase\s*[1-3]|wave\s*[1-3]|mvp|v1|v2)\b/gi,
  // Section detection: explicit priority sections OR MoSCoW-style headers
  section: /^#+\s*(\d+\.?\d*\.?\s*)?(priority|priorities|prioritization|must\s+have|should\s+have|could\s+have|won't\s+have)/im
};

// Customer evidence detection patterns
// Expanded to recognize evidence signals common in internal/pilot PRDs
const CUSTOMER_EVIDENCE_PATTERNS = {
  research: /\b(user research|customer research|user interview|customer interview|usability test|user study|survey result|focus group|market research|competitive analysis|discovery)\b/gi,
  data: /\b(data shows|analytics indicate|metrics show|we found that|research indicates|\d+%\s+of\s+(users|customers)|based on experience|observed that|common pattern|industry standard|best practice)\b/gi,
  quotes: /"[^"]{10,}"|\u201c[^\u201d]{10,}\u201d/g,
  feedback: /\b(customer feedback|user feedback|nps|csat|support ticket|feature request|pain point|user complaint|friction)\b/gi,
  validation: /\b(validated|tested with|confirmed by|based on feedback from|pilot|dogfood|internal testing|beta|prototype testing|proof of concept)\b/gi
};

// Scope boundary detection patterns
const SCOPE_PATTERNS = {
  inScope: /\b(in.scope|included|within scope|we will)\b/gi,
  outOfScope: /\b(out.of.scope|not included|excluded|we will not|won't|outside scope|future consideration|not in v1|post.mvp|phase 2)\b/gi,
  scopeSection: /^#+\s*(scope|boundaries)/im
};

// Value Proposition detection patterns
const VALUE_PROPOSITION_PATTERNS = {
  section: /^#+\s*(\d+\.?\d*\.?\s*)?(value\s+proposition|value\s+to\s+customer|value\s+to\s+partner|value\s+to\s+company|customer\s+value|business\s+value)/im,
  customerValue: /\b(value\s+to\s+(customer|partner|user|client)|customer\s+benefit|partner\s+benefit|user\s+benefit)\b/gi,
  companyValue: /\b(value\s+to\s+(company|business|organization)|business\s+value|revenue\s+impact|cost\s+saving|strategic\s+value)\b/gi,
  quantifiedBenefit: /\b(\d+%|\$\d+|\d+\s*(hours?|days?|minutes?|weeks?)\s*(saved|reduced|faster)|reduce[ds]?\s+from\s+\d+|increase[ds]?\s+from\s+\d+)\b/gi,
  vagueValue: /\b(improve[ds]?|enhance[ds]?|better|more\s+efficient|streamline[ds]?)\s+(the\s+)?(experience|process|workflow|operations?)\b/gi
};

const USER_STORY_PATTERN = /as\s+a[n]?\s+[\w\s]+,?\s+i\s+want/gi;
// Accept both inline "given...when...then" and markdown bold "**Given**...When...Then"
const ACCEPTANCE_CRITERIA_PATTERN = /(?:\*\*)?given(?:\*\*)?\s+.+?(?:\*\*)?when(?:\*\*)?\s+.+?(?:\*\*)?then(?:\*\*)?\s+/gi;
// Also count structured acceptance criteria with bullet points using Given/When/Then keywords
const AC_KEYWORD_PATTERN = /-\s*\*\*Given\*\*/gi;
// Expanded measurable pattern to include more units and comparison operators
const MEASURABLE_PATTERN = /(?:≤|≥|<|>|=)?\s*\d+(?:\.\d+)?\s*(ms|millisecond|second|minute|hour|day|week|%|percent|\$|dollar|user|request|transaction|item|task|point|pt)/gi;

// ============================================================================
// Section Detection
// ============================================================================

/**
 * Detect which required sections are present in the document
 * @param {string} text - PRD content
 * @returns {Object} Sections found and missing
 */
export function detectSections(text) {
  const found = [];
  const missing = [];

  for (const section of REQUIRED_SECTIONS) {
    if (section.pattern.test(text)) {
      found.push({ name: section.name, weight: section.weight });
    } else {
      missing.push({ name: section.name, weight: section.weight });
    }
  }

  return { found, missing };
}

/**
 * Score document structure (25 pts max)
 * @param {string} text - PRD content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreDocumentStructure(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  // Core structural elements (0-12 pts)
  const sections = detectSections(text);
  const sectionScore = sections.found.reduce((sum, s) => sum + s.weight, 0);
  score += sectionScore;

  if (sections.found.length >= 6) {
    strengths.push(`${sections.found.length} core sections present`);
  }
  sections.missing.forEach(s => {
    issues.push(`Missing section: ${s.name}`);
  });

  // Document organization (0-7 pts) - check heading hierarchy
  const headings = text.match(/^#+\s+.+$/gm) || [];
  const hasH1 = headings.some(h => h.startsWith('# '));
  const hasH2 = headings.some(h => h.startsWith('## '));

  if (hasH1 && hasH2) {
    score += 4;
    strengths.push('Good heading hierarchy');
  } else if (headings.length > 0) {
    score += 2;
  } else {
    issues.push('No clear heading structure');
  }

  // Check for logical flow (purpose before features)
  const purposeIndex = text.search(/^#+\s*(purpose|introduction|overview)/im);
  const featuresIndex = text.search(/^#+\s*(feature|requirement)/im);
  if (purposeIndex >= 0 && featuresIndex >= 0 && purposeIndex < featuresIndex) {
    score += 3;
    strengths.push('Logical document flow (context before requirements)');
  }

  // Formatting consistency (0-4 pts) - check for bullet list consistency
  const bulletTypes = new Set();
  if (/^-\s+/m.test(text)) bulletTypes.add('dash');
  // Only count asterisk bullets at start of line (not bold **text**)
  if (/^\*\s+[^*]/m.test(text)) bulletTypes.add('asterisk');
  if (/^\d+\.\s/m.test(text)) bulletTypes.add('numbered');

  // Having both dash and numbered is fine (common pattern); only penalize mixing dash/asterisk bullets
  const hasMixedBullets = bulletTypes.has('dash') && bulletTypes.has('asterisk');
  if (!hasMixedBullets && text.length > 200) {
    score += 2;
    strengths.push('Consistent formatting');
  } else if (hasMixedBullets) {
    score += 1;
    issues.push('Inconsistent bullet point formatting (mixing - and * bullets)');
  }

  // Check for tables (structured data)
  if (/\|.+\|/.test(text)) {
    score += 2;
    strengths.push('Uses tables for structured information');
  }

  // Scope boundaries (0-2 pts bonus) - NEW
  const scopeBoundaries = detectScopeBoundaries(text);
  if (scopeBoundaries.hasBothBoundaries) {
    score += 2;
    strengths.push('Clear scope boundaries with explicit in-scope and out-of-scope definitions');
  } else if (scopeBoundaries.hasOutOfScope) {
    score += 1;
    issues.push('Add explicit "In Scope" items to complement out-of-scope definitions');
  } else if (scopeBoundaries.hasScopeSection) {
    issues.push('Scope section found but missing explicit "Out of Scope" items - define what you\'re NOT building');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths,
    sections,
    scopeBoundaries
  };
}

// ============================================================================
// Requirements Clarity Detection
// ============================================================================

/**
 * Detect vague qualifiers in text
 * @param {string} text - Text to analyze
 * @returns {string[]} List of vague qualifiers found
 */
export function detectVagueQualifiers(text) {
  const found = [];
  const lowerText = text.toLowerCase();

  for (const qualifier of VAGUE_QUALIFIERS) {
    if (lowerText.includes(qualifier)) {
      found.push(qualifier);
    }
  }

  return found;
}

/**
 * Check if a term appears as a whole word in text using word boundaries
 * @param {string} text - Text to search in
 * @param {string} term - Term to find
 * @returns {boolean} True if term found as whole word
 */
function hasWholeWord(text, term) {
  // Escape special regex characters in the term
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
  return pattern.test(text);
}

/**
 * Detect vague language across all categories
 * Uses word boundary matching to avoid false positives like "some" matching "sometimes"
 * @param {string} text - Text to analyze
 * @returns {Object} Categorized vague language findings
 */
export function detectVagueLanguage(text) {
  const result = {
    qualifiers: [],
    quantifiers: [],
    temporal: [],
    weaselWords: [],
    marketingFluff: [],
    unquantifiedComparatives: [],
    totalCount: 0
  };

  // Check each category using word boundary matching
  for (const term of VAGUE_LANGUAGE.qualifiers) {
    if (hasWholeWord(text, term)) {
      result.qualifiers.push(term);
    }
  }

  for (const term of VAGUE_LANGUAGE.quantifiers) {
    if (hasWholeWord(text, term)) {
      result.quantifiers.push(term);
    }
  }

  for (const term of VAGUE_LANGUAGE.temporal) {
    if (hasWholeWord(text, term)) {
      result.temporal.push(term);
    }
  }

  for (const term of VAGUE_LANGUAGE.weaselWords) {
    if (hasWholeWord(text, term)) {
      result.weaselWords.push(term);
    }
  }

  for (const term of VAGUE_LANGUAGE.marketingFluff) {
    if (hasWholeWord(text, term)) {
      result.marketingFluff.push(term);
    }
  }

  for (const term of VAGUE_LANGUAGE.unquantifiedComparatives) {
    if (hasWholeWord(text, term)) {
      result.unquantifiedComparatives.push(term);
    }
  }

  result.totalCount =
    result.qualifiers.length +
    result.quantifiers.length +
    result.temporal.length +
    result.weaselWords.length +
    result.marketingFluff.length +
    result.unquantifiedComparatives.length;

  return result;
}

/**
 * Detect prioritization signals in text
 * @param {string} text - Text to analyze
 * @returns {Object} Prioritization detection results
 */
export function detectPrioritization(text) {
  const moscowMatches = text.match(PRIORITIZATION_PATTERNS.moscow) || [];
  const pLevelMatches = text.match(PRIORITIZATION_PATTERNS.pLevel) || [];
  const numberedMatches = text.match(PRIORITIZATION_PATTERNS.numbered) || [];
  const tieredMatches = text.match(PRIORITIZATION_PATTERNS.tiered) || [];
  const hasPrioritySection = PRIORITIZATION_PATTERNS.section.test(text);

  return {
    hasMoscow: moscowMatches.length > 0,
    moscowCount: moscowMatches.length,
    hasPLevel: pLevelMatches.length > 0,
    pLevelCount: pLevelMatches.length,
    hasNumbered: numberedMatches.length > 0,
    hasTiered: tieredMatches.length > 0,
    hasPrioritySection,
    totalSignals: moscowMatches.length + pLevelMatches.length + numberedMatches.length + tieredMatches.length
  };
}

/**
 * Detect customer evidence in text
 * @param {string} text - Text to analyze
 * @returns {Object} Customer evidence detection results
 */
export function detectCustomerEvidence(text) {
  const researchMatches = text.match(CUSTOMER_EVIDENCE_PATTERNS.research) || [];
  const dataMatches = text.match(CUSTOMER_EVIDENCE_PATTERNS.data) || [];
  const quoteMatches = text.match(CUSTOMER_EVIDENCE_PATTERNS.quotes) || [];
  const feedbackMatches = text.match(CUSTOMER_EVIDENCE_PATTERNS.feedback) || [];
  const validationMatches = text.match(CUSTOMER_EVIDENCE_PATTERNS.validation) || [];

  const hasResearch = researchMatches.length > 0;
  const hasData = dataMatches.length > 0;
  const hasQuotes = quoteMatches.length > 0;
  const hasFeedback = feedbackMatches.length > 0;
  const hasValidation = validationMatches.length > 0;

  // Count how many evidence types are present
  let evidenceTypes = 0;
  if (hasResearch) evidenceTypes++;
  if (hasData) evidenceTypes++;
  if (hasQuotes) evidenceTypes++;
  if (hasFeedback) evidenceTypes++;
  if (hasValidation) evidenceTypes++;

  return {
    hasResearch,
    researchTerms: researchMatches.map(m => m.toLowerCase()),
    hasData,
    hasQuotes,
    quoteCount: quoteMatches.length,
    hasFeedback,
    hasValidation,
    evidenceTypes
  };
}

/**
 * Detect scope boundary definitions in text
 * @param {string} text - Text to analyze
 * @returns {Object} Scope boundary detection results
 */
export function detectScopeBoundaries(text) {
  const inScopeMatches = text.match(SCOPE_PATTERNS.inScope) || [];
  const outOfScopeMatches = text.match(SCOPE_PATTERNS.outOfScope) || [];
  const hasScopeSection = SCOPE_PATTERNS.scopeSection.test(text);

  const hasInScope = inScopeMatches.length > 0;
  const hasOutOfScope = outOfScopeMatches.length > 0;

  return {
    hasInScope,
    hasOutOfScope,
    hasBothBoundaries: hasInScope && hasOutOfScope,
    hasScopeSection
  };
}

/**
 * Detect Value Proposition section and quality in text
 * @param {string} text - Text to analyze
 * @returns {Object} Value proposition detection results
 */
export function detectValueProposition(text) {
  const hasSection = VALUE_PROPOSITION_PATTERNS.section.test(text);
  const customerValueMatches = text.match(VALUE_PROPOSITION_PATTERNS.customerValue) || [];
  const companyValueMatches = text.match(VALUE_PROPOSITION_PATTERNS.companyValue) || [];
  const quantifiedMatches = text.match(VALUE_PROPOSITION_PATTERNS.quantifiedBenefit) || [];
  const vagueMatches = text.match(VALUE_PROPOSITION_PATTERNS.vagueValue) || [];

  const hasCustomerValue = customerValueMatches.length > 0;
  const hasCompanyValue = companyValueMatches.length > 0;
  const hasBothPerspectives = hasCustomerValue && hasCompanyValue;
  const hasQuantification = quantifiedMatches.length > 0;
  const hasVagueValue = vagueMatches.length > 0;

  // Quality score: 0-4
  let qualityScore = 0;
  if (hasSection) qualityScore += 1;
  if (hasBothPerspectives) qualityScore += 1;
  if (hasQuantification) qualityScore += 1;
  if (!hasVagueValue || quantifiedMatches.length > vagueMatches.length) qualityScore += 1;

  return {
    hasSection,
    hasCustomerValue,
    hasCompanyValue,
    hasBothPerspectives,
    hasQuantification,
    hasVagueValue,
    quantifiedCount: quantifiedMatches.length,
    vagueCount: vagueMatches.length,
    qualityScore
  };
}

/**
 * Count user stories in text
 * @param {string} text - Text to analyze
 * @returns {number} Number of user stories found
 */
export function countUserStories(text) {
  const matches = text.match(USER_STORY_PATTERN) || [];
  return matches.length;
}

/**
 * Count acceptance criteria in text
 * Detects both inline "given...when...then" and markdown "**Given**" bullet format
 * @param {string} text - Text to analyze
 * @returns {number} Number of acceptance criteria found
 */
export function countAcceptanceCriteria(text) {
  // Count inline given/when/then patterns
  const inlineMatches = text.match(ACCEPTANCE_CRITERIA_PATTERN) || [];
  // Count structured bullet-point Given keywords (each represents one AC)
  const bulletMatches = text.match(AC_KEYWORD_PATTERN) || [];
  // Return max to avoid double-counting same criteria in different formats
  return Math.max(inlineMatches.length, bulletMatches.length);
}

/**
 * Count measurable requirements in text
 * @param {string} text - Text to analyze
 * @returns {number} Number of measurable requirements found
 */
export function countMeasurableRequirements(text) {
  const matches = text.match(MEASURABLE_PATTERN) || [];
  return matches.length;
}

/**
 * Score requirements clarity (30 pts max)
 * Updated allocation: Precision 8, Completeness 8, Measurability 8, Prioritization 6
 * @param {string} text - PRD content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreRequirementsClarity(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 30;

  // Requirement precision (0-8 pts) - comprehensive AI slop and vague language detection
  const vagueQualifiers = detectVagueQualifiers(text);
  const vagueLanguage = detectVagueLanguage(text);
  const slopPenalty = getSlopPenalty(text);

  // Use the more comprehensive slop detection for scoring
  // Slop score of 0 = 8 pts, higher slop = lower score
  const precisionScore = Math.max(0, 8 - slopPenalty.penalty);
  score += precisionScore;

  if (slopPenalty.slopScore === 0) {
    strengths.push('No AI slop or vague language detected');
  } else if (slopPenalty.severity === 'clean') {
    strengths.push('Minimal AI patterns detected');
  } else {
    // Add slop-related issues
    slopPenalty.issues.forEach(issue => issues.push(issue));
  }

  // Completeness of details (0-8 pts) - user stories with context
  const userStoryCount = countUserStories(text);

  if (userStoryCount >= 3) {
    score += 8;
    strengths.push(`${userStoryCount} user stories with proper format`);
  } else if (userStoryCount >= 1) {
    score += 5;
    strengths.push(`${userStoryCount} user story found`);
  } else {
    // Check for alternative requirement formats
    const requirementPatterns = text.match(/\b(shall|must|should|will)\b/gi) || [];
    if (requirementPatterns.length >= 5) {
      score += 3;
      issues.push('Consider using user story format (As a..., I want..., So that...)');
    } else {
      issues.push('No user stories found - use format: "As a [user], I want [feature] so that [benefit]"');
    }
  }

  // Measurable criteria (0-8 pts)
  const measurableCount = countMeasurableRequirements(text);

  if (measurableCount >= 5) {
    score += 8;
    strengths.push(`${measurableCount} measurable criteria found`);
  } else if (measurableCount >= 2) {
    score += 5;
    strengths.push(`${measurableCount} measurable criteria found`);
  } else if (measurableCount >= 1) {
    score += 2;
    issues.push('Add more measurable criteria (e.g., response times, percentages, counts)');
  } else {
    issues.push('No measurable criteria - requirements should include specific numbers');
  }

  // Prioritization (0-6 pts) - NEW
  const prioritization = detectPrioritization(text);

  if (prioritization.hasPrioritySection && (prioritization.hasMoscow || prioritization.hasPLevel)) {
    score += 6;
    const method = prioritization.hasMoscow ? 'MoSCoW' : 'P-level';
    strengths.push(`Uses ${method} prioritization with dedicated section`);
  } else if (prioritization.hasMoscow || prioritization.hasPLevel) {
    score += 4;
    const method = prioritization.hasMoscow ? 'MoSCoW' : 'P-level';
    strengths.push(`Uses ${method} prioritization`);
  } else if (prioritization.hasTiered || prioritization.totalSignals > 0) {
    score += 2;
    issues.push('Consider using explicit prioritization (MoSCoW: Must/Should/Could/Won\'t or P0/P1/P2)');
  } else {
    issues.push('No feature prioritization found - use MoSCoW or P0/P1/P2 labels');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths,
    vagueQualifiers,
    vagueLanguage,
    slopDetection: slopPenalty,
    userStoryCount,
    measurableCount,
    prioritization
  };
}

// ============================================================================
// User Focus Detection
// ============================================================================

/**
 * Detect user persona indicators in text
 * @param {string} text - Text to analyze
 * @returns {Object} Persona detection results
 */
export function detectUserPersonas(text) {
  const personaIndicators = [];

  // Check for persona section - supports numbered headers and various naming conventions
  const hasPersonaSection = /^#+\s*(\d+\.?\d*\.?\s*)?(user\s*persona|personas?|target\s+user|audience|customer\s+profile|primary\s+user)/im.test(text);
  if (hasPersonaSection) {
    personaIndicators.push('Dedicated persona section');
  }

  // Check for specific user type mentions - expanded list of common roles
  const userTypes = text.match(/\b(admin|administrator|end.?user|power.?user|developer|manager|customer|stakeholder|buyer|seller|operator|analyst|engineer|designer|user|professional|owner|team\s+lead|solo\s+developer)\b/gi) || [];
  const uniqueUserTypes = [...new Set(userTypes.map(u => u.toLowerCase().trim()))];

  // Check for pain point language
  const hasPainPoints = /\b(pain.?point|problem|challenge|frustrat|struggle|difficult|issue|context.?switch|cognitive\s+overhead|loses?\s+track|scattered|disorganized)\b/i.test(text);
  if (hasPainPoints) {
    personaIndicators.push('Pain points addressed');
  }

  // Check for user journey/scenario language
  const hasScenarios = /\b(scenario|use.?case|user.?journey|workflow|user.?flow|daily\s+routine|typical\s+day)\b/i.test(text);
  if (hasScenarios) {
    personaIndicators.push('User scenarios described');
  }

  // Check for persona depth indicators (detailed description, not just a label)
  const hasPersonaDepth = /\*\*primary\s+user\*\*:|\*\*target\s+user\*\*:|who\s+(will|would)\s+use|target\s+audience\s+is/i.test(text);
  if (hasPersonaDepth) {
    personaIndicators.push('Detailed persona description');
  }

  return {
    hasPersonaSection,
    userTypes: uniqueUserTypes,
    hasPainPoints,
    hasScenarios,
    hasPersonaDepth,
    indicators: personaIndicators
  };
}

/**
 * Detect problem statement in text
 * @param {string} text - Text to analyze
 * @returns {Object} Problem statement detection results
 */
export function detectProblemStatement(text) {
  const indicators = [];

  // Check for problem/goal statement section - supports numbered headers
  const hasProblemSection = /^#+\s*(\d+\.?\d*\.?\s*)?(problem|goal|objective|why|motivation|current\s+state|target\s+state)/im.test(text);
  if (hasProblemSection) {
    indicators.push('Dedicated problem statement section');
  }

  // Check for problem framing language
  const hasProblemLanguage = /\b(problem|challenge|current.?state|today|existing|pain)\b/i.test(text);
  if (hasProblemLanguage) {
    indicators.push('Problem framing language');
  }

  // Check for value proposition language - common terms that express benefits/outcomes
  // Includes: direct value words, action verbs that imply benefit, solution-oriented language
  const hasValueProp = /\b(value|benefit|outcome|result|enable|empower|improve|reduce|increase|streamline|automate|simplify|eliminate|save|prevent|accelerate|enhance|optimize|transform|deliver|provide|ensure|achieve|solution|unified|integrated|seamless|efficient)\b/i.test(text);
  if (hasValueProp) {
    indicators.push('Value proposition language');
  }

  // Check for "why" explanations
  const hasWhyExplanation = /\b(so\s+that|in\s+order\s+to|because|this\s+will|enabling)\b/i.test(text);
  if (hasWhyExplanation) {
    indicators.push('Explains "why" behind requirements');
  }

  return {
    hasProblemSection,
    hasProblemLanguage,
    hasValueProp,
    hasWhyExplanation,
    indicators
  };
}

/**
 * Score user focus (25 pts max)
 * Allocation: Personas 7, Problem Statement 7, Alignment 4, Customer Evidence 3, Value Proposition 4
 * @param {string} text - PRD content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreUserFocus(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  // User persona definition (0-7 pts)
  // Credit well-defined single personas as much as multiple shallow personas
  const personas = detectUserPersonas(text);

  // Calculate persona quality score based on depth indicators
  const personaQuality =
    (personas.hasPersonaSection ? 2 : 0) +
    (personas.userTypes.length >= 2 ? 2 : (personas.userTypes.length >= 1 ? 1 : 0)) +
    (personas.hasPainPoints ? 1 : 0) +
    (personas.hasScenarios ? 1 : 0) +
    (personas.hasPersonaDepth ? 1 : 0);

  if (personaQuality >= 5) {
    score += 7;
    if (personas.userTypes.length >= 2) {
      strengths.push(`${personas.userTypes.length} user types identified with dedicated section`);
    } else {
      strengths.push('Well-defined user persona with pain points and context');
    }
  } else if (personaQuality >= 3) {
    score += 5;
    if (personas.userTypes.length > 0) {
      strengths.push(`User types identified: ${personas.userTypes.slice(0, 3).join(', ')}`);
    }
    if (personas.hasPainPoints) {
      strengths.push('User pain points addressed');
    }
  } else if (personaQuality >= 2) {
    score += 3;
    if (personas.userTypes.length > 0) {
      strengths.push(`User types identified: ${personas.userTypes.slice(0, 3).join(', ')}`);
    }
    issues.push('Add more persona depth (pain points, scenarios, detailed descriptions)');
  } else if (personas.userTypes.length >= 1) {
    score += 2;
    issues.push('Add dedicated User Personas section with detailed descriptions');
  } else {
    issues.push('No user personas found - identify who will use this product');
  }

  // Problem statement (0-7 pts)
  const problem = detectProblemStatement(text);

  if (problem.hasProblemSection && problem.hasValueProp) {
    score += 7;
    strengths.push('Clear problem statement with value proposition');
  } else if (problem.hasProblemLanguage && problem.hasValueProp) {
    score += 4;
    issues.push('Consider adding a dedicated Problem Statement section');
  } else if (problem.hasProblemLanguage || problem.hasValueProp) {
    score += 2;
    issues.push('Strengthen the problem statement and value proposition');
  } else {
    issues.push('Missing problem statement - explain what problem this solves');
  }

  // Alignment between requirements and user needs (0-4 pts)
  const userStoryCount = countUserStories(text);

  if (userStoryCount >= 3 && problem.hasWhyExplanation) {
    score += 4;
    strengths.push('Requirements clearly linked to user needs');
  } else if (userStoryCount >= 1 || problem.hasWhyExplanation) {
    score += 2;
    if (userStoryCount === 0) {
      issues.push('Use user stories to connect features to user needs');
    }
  } else {
    issues.push('Requirements should trace back to user needs');
  }

  // Customer evidence (0-3 pts)
  const customerEvidence = detectCustomerEvidence(text);

  if (customerEvidence.evidenceTypes >= 3) {
    score += 3;
    const types = [];
    if (customerEvidence.hasResearch) types.push('research');
    if (customerEvidence.hasData) types.push('data');
    if (customerEvidence.hasQuotes) types.push('quotes');
    if (customerEvidence.hasFeedback) types.push('feedback');
    strengths.push(`Customer evidence: ${types.join(', ')}`);
  } else if (customerEvidence.evidenceTypes >= 2) {
    score += 2;
    strengths.push('Some customer evidence present');
  } else if (customerEvidence.evidenceTypes >= 1) {
    score += 1;
    issues.push('Add more customer evidence (research, data, quotes, feedback)');
  } else {
    issues.push('No customer evidence found - include user research, quotes, or usage data');
  }

  // Value Proposition (0-4 pts)
  const valueProposition = detectValueProposition(text);

  if (valueProposition.qualityScore >= 4) {
    score += 4;
    strengths.push('Value proposition with dual perspective and quantified benefits');
  } else if (valueProposition.qualityScore >= 3) {
    score += 3;
    if (valueProposition.hasBothPerspectives) {
      strengths.push('Value proposition addresses both customer and company perspectives');
    }
  } else if (valueProposition.qualityScore >= 2) {
    score += 2;
    if (!valueProposition.hasBothPerspectives) {
      issues.push('Add value from both customer/partner AND company perspectives');
    }
    if (!valueProposition.hasQuantification) {
      issues.push('Quantify value claims with specific metrics');
    }
  } else if (valueProposition.hasSection || valueProposition.hasCustomerValue || valueProposition.hasCompanyValue) {
    score += 1;
    issues.push('Strengthen value proposition with quantified benefits and dual perspective');
  } else {
    issues.push('Add Value Proposition section with customer/partner AND company benefits');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths,
    personas,
    problem,
    customerEvidence,
    valueProposition
  };
}

// ============================================================================
// Technical Quality Detection
// ============================================================================

/**
 * Detect non-functional requirements in text
 * @param {string} text - Text to analyze
 * @returns {Object} Non-functional requirements detection results
 */
export function detectNonFunctionalRequirements(text) {
  const categories = [];

  // Performance requirements
  if (/\b(performance|latency|response.?time|throughput|speed)\b/i.test(text)) {
    categories.push('performance');
  }

  // Reliability requirements
  if (/\b(reliability|uptime|availability|recovery|backup|failover)\b/i.test(text)) {
    categories.push('reliability');
  }

  // Security requirements
  if (/\b(security|authentication|authorization|encrypt|privacy|access.?control)\b/i.test(text)) {
    categories.push('security');
  }

  // Scalability requirements
  if (/\b(scalab|capacity|concurrent|load|volume)\b/i.test(text)) {
    categories.push('scalability');
  }

  // Usability/Accessibility requirements
  if (/\b(usability|accessibility|wcag|508|a11y)\b/i.test(text)) {
    categories.push('usability');
  }

  // Compliance requirements
  if (/\b(compliance|regulatory|gdpr|hipaa|sox|pci)\b/i.test(text)) {
    categories.push('compliance');
  }

  return {
    categories,
    count: categories.length,
    // Support numbered headers and various NFR naming conventions
    hasNFRSection: /^#+\s*(\d+\.?\d*\.?\s*)?(non.?functional|quality\s+attribute|nfr|performance|security|technical\s+requirement)/im.test(text)
  };
}

/**
 * Score technical quality (20 pts max)
 * @param {string} text - PRD content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreTechnicalQuality(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 20;

  // Non-functional requirements (0-7 pts)
  const nfr = detectNonFunctionalRequirements(text);

  if (nfr.count >= 4 && nfr.hasNFRSection) {
    score += 7;
    strengths.push(`${nfr.count} NFR categories addressed in dedicated section`);
  } else if (nfr.count >= 3) {
    score += 5;
    strengths.push(`${nfr.count} NFR categories mentioned: ${nfr.categories.join(', ')}`);
  } else if (nfr.count >= 1) {
    score += 2;
    issues.push('Add more non-functional requirements (performance, security, reliability)');
  } else {
    issues.push('Missing non-functional requirements - define quality attributes');
  }

  // Acceptance criteria (0-7 pts)
  const acceptanceCriteriaCount = countAcceptanceCriteria(text);

  if (acceptanceCriteriaCount >= 3) {
    score += 7;
    strengths.push(`${acceptanceCriteriaCount} acceptance criteria in Given/When/Then format`);
  } else if (acceptanceCriteriaCount >= 1) {
    score += 4;
    strengths.push(`${acceptanceCriteriaCount} acceptance criteria found`);
  } else {
    // Check for alternative acceptance criteria formats
    const hasCheckboxes = /\[[ x]\]/i.test(text);
    if (hasCheckboxes) {
      score += 2;
      issues.push('Consider using Given/When/Then format for acceptance criteria');
    } else {
      issues.push('No acceptance criteria - add testable verification conditions');
    }
  }

  // Dependencies and constraints (0-6 pts)
  const hasDependencies = /^#+\s*(depend|risk|assumption|constraint)/im.test(text);
  const mentionsDependencies = /\b(depends.?on|requires|prerequisite|blocker|assumption)\b/i.test(text);

  if (hasDependencies && mentionsDependencies) {
    score += 6;
    strengths.push('Dependencies and constraints documented');
  } else if (hasDependencies || mentionsDependencies) {
    score += 3;
    issues.push('Document all dependencies, assumptions, and constraints');
  } else {
    issues.push('Missing dependencies/constraints section');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths,
    nfr,
    acceptanceCriteriaCount
  };
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validate a PRD and return comprehensive scoring results
 * @param {string} text - PRD content
 * @returns {Object} Complete validation results
 */
export function validatePRD(text) {
  if (!text || typeof text !== 'string') {
    return {
      totalScore: 0,
      structure: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      clarity: { score: 0, maxScore: 30, issues: ['No content to validate'], strengths: [] },
      userFocus: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      technical: { score: 0, maxScore: 20, issues: ['No content to validate'], strengths: [] }
    };
  }

  const structure = scoreDocumentStructure(text);
  const clarity = scoreRequirementsClarity(text);
  const userFocus = scoreUserFocus(text);
  const technical = scoreTechnicalQuality(text);

  // AI slop detection (aligned with inline validator)
  const slopPenalty = getSlopPenalty(text);
  let slopDeduction = 0;
  const slopIssues = [];

  if (slopPenalty.penalty > 0) {
    slopDeduction = Math.min(5, Math.floor(slopPenalty.penalty * 0.6));
    if (slopPenalty.issues.length > 0) {
      slopIssues.push(...slopPenalty.issues.slice(0, 2));
    }
  }

  const totalScore = Math.max(0,
    structure.score + clarity.score + userFocus.score + technical.score - slopDeduction
  );

  return {
    totalScore,
    structure,
    clarity,
    userFocus,
    technical,
    vagueQualifiers: clarity.vagueQualifiers,
    slopDetection: {
      ...slopPenalty,
      deduction: slopDeduction,
      issues: slopIssues
    }
  };
}

// Re-export slop detection for direct access
export { calculateSlopScore } from './slop-detection.js';

// Alias for backward compatibility with assistant UI
export function validateDocument(text) {
  return validatePRD(text);
}

export function getScoreColor(score) {
  if (score >= 70) return 'green';
  if (score >= 50) return 'yellow';
  if (score >= 30) return 'orange';
  return 'red';
}

export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Ready';
  if (score >= 50) return 'Needs Work';
  if (score >= 30) return 'Draft';
  return 'Incomplete';
}
