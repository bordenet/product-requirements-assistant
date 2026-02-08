/**
 * PRD Validator - Scoring Logic
 *
 * Scoring Dimensions:
 * 1. Document Structure (20 pts) - Section presence, organization, formatting
 * 2. Requirements Clarity (25 pts) - Precision, completeness, consistency
 * 3. User Focus (20 pts) - Personas, problem statement, alignment
 * 4. Technical Quality (15 pts) - Non-functional reqs, acceptance criteria, traceability
 * 5. Strategic Viability (20 pts) - Metric validity, scope realism, traceability
 */

import { getSlopPenalty, calculateSlopScore } from './slop-detection.js';

// ============================================================================
// Constants
// ============================================================================

// Section patterns aligned with Phase1.md's 14 required sections
// Total weight: 20 (10 pts from section coverage scaled)
const REQUIRED_SECTIONS = [
  // High-weight sections (2 pts each)
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(executive\s+summary|purpose|introduction|overview)/im, name: 'Executive Summary', weight: 2 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(problem\s+statement|current\s+state)/im, name: 'Problem Statement', weight: 2 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(value\s+proposition)/im, name: 'Value Proposition', weight: 2 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(goal|objective|success\s+metric|kpi)/im, name: 'Goals and Objectives', weight: 2 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(customer\s+faq|external\s+faq|working\s+backwards)/im, name: 'Customer FAQ', weight: 2 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(proposed\s+solution|solution|core\s+functionality)/im, name: 'Proposed Solution', weight: 2 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(requirement|functional\s+requirement|non.?functional)/im, name: 'Requirements', weight: 2 },
  // Medium-weight sections (1.5 pts each)
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(scope|in.scope|out.of.scope)/im, name: 'Scope', weight: 1.5 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(stakeholder)/im, name: 'Stakeholders', weight: 1.5 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(timeline|milestone|schedule|roadmap)/im, name: 'Timeline', weight: 1 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(risk|mitigation)/im, name: 'Risks and Mitigation', weight: 1 },
  // Lower-weight sections (1 pt each)
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(traceability|requirement\s+mapping)/im, name: 'Traceability Summary', weight: 1 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(open\s+question)/im, name: 'Open Questions', weight: 1 },
  { pattern: /^#+\s*(\d+\.?\d*\.?\s*)?(known\s+unknown|dissenting\s+opinion|unresolved)/im, name: 'Known Unknowns & Dissenting Opinions', weight: 1 }
];

// Total section weight: 20 pts (matching Document Structure max)

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
// Functional Requirements pattern: FR1, FR2, etc. with structured format
const FUNCTIONAL_REQ_PATTERN = /\bFR\d+\b/gi;
// Door Type indicators (One-Way/Two-Way decision tagging)
const DOOR_TYPE_PATTERN = /(?:🚪|🔄|one[- ]?way|two[- ]?way)\s*(?:door)?/gi;
// Problem Link pattern: references to P1, P2, etc.
const PROBLEM_LINK_PATTERN = /\bP\d+\b/gi;
// Accept both inline "given...when...then" and markdown bold "**Given**...When...Then"
const ACCEPTANCE_CRITERIA_PATTERN = /(?:\*\*)?given(?:\*\*)?\s+.+?(?:\*\*)?when(?:\*\*)?\s+.+?(?:\*\*)?then(?:\*\*)?\s+/gi;
// Also count structured acceptance criteria with bullet points using Given/When/Then keywords
const AC_KEYWORD_PATTERN = /-\s*\*\*Given\*\*/gi;
// Expanded measurable pattern to include more units and comparison operators
const MEASURABLE_PATTERN = /(?:≤|≥|<|>|=)?\s*\d+(?:\.\d+)?\s*(ms|millisecond|second|minute|hour|day|week|%|percent|\$|dollar|user|request|transaction|item|task|point|pt)/gi;

// Strategic Viability detection patterns
const STRATEGIC_VIABILITY_PATTERNS = {
  // Leading vs Lagging indicators
  leadingIndicator: /\b(leading\s+indicator|predictive|early\s+signal|adoption\s+rate|activation|first\s+action|time\s+to\s+value|onboarding\s+completion)\b/gi,
  laggingIndicator: /\b(lagging\s+indicator|revenue|nps|churn|retention|ltv|arpu|conversion\s+rate)\b/gi,
  // Counter-metrics to prevent perverse incentives
  counterMetric: /\b(counter[\s-]?metric|guardrail\s+metric|balance\s+metric|must\s+not\s+degrade|no\s+decrease\s+in)\b/gi,
  // Source of truth for metrics
  sourceOfTruth: /\b(source\s+of\s+truth|measured\s+(via|in|by|using)|tracked\s+in|mixpanel|amplitude|datadog|segment|google\s+analytics|salesforce|looker|tableau)\b/gi,
  // Hypothesis kill switch
  killSwitch: /\b(kill\s+(switch|criteria)|pivot\s+or\s+persevere|failure\s+criteria|rollback\s+(plan|criteria)|prove.*(wrong|failure)|abort\s+criteria)\b/gi,
  // Traceability
  traceability: /\b(traceability|traces?\s+to|maps?\s+to|linked\s+to\s+problem|requirement\s+id|fr\d+|nfr\d+|problem\s+id|p\d+\s*[-:→]|→|<-)\b/gi,
  traceabilitySection: /^#+\s*(\d+\.?\d*\.?\s*)?(traceability|requirement\s+mapping|problem[\s-]requirement\s+matrix)/im,
  // Alternatives considered (show your work)
  alternativesConsidered: /^#+\s*(\d+\.?\d*\.?\s*)?(alternative|rejected\s+approach|other\s+option|we\s+considered)/im,
  alternativesContent: /\b(rejected\s+because|we\s+considered|alternative\s+(was|approach)|instead\s+of|trade[\s-]?off)\b/gi,
  // One-Way vs Two-Way Door
  doorType: /\b(one[\s-]?way\s+door|two[\s-]?way\s+door|irreversible|reversible|high\s+cost\s+of\s+change|easy\s+to\s+pivot|🚪|🔄)\b/gi,
  // Dissenting opinions
  dissentingOpinions: /^#+\s*(\d+\.?\d*\.?\s*)?(dissenting|disagree|known\s+unknown|unresolved\s+debate|open\s+question|trade[\s-]?off)/im,
  dissentingContent: /\b(dissenting\s+opinion|unresolved\s+debate|stakeholder\s+disagree|we\s+disagree|different\s+view|known\s+unknown)\b/gi,
  // Customer FAQ (Working Backwards)
  customerFAQ: /^#+\s*(\d+\.?\d*\.?\s*)?(customer\s+faq|external\s+faq|working\s+backwards|press\s+release|aha\s+moment)/im,
  ahaQuote: /"[^"]{20,}".*—|before\s+\[.+\].*after|customer\s+quote/gi
};

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
 * Score document structure (20 pts max)
 * @param {string} text - PRD content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreDocumentStructure(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 20;

  // Core structural elements (0-10 pts, scaled from total weight ~20)
  const sections = detectSections(text);
  const totalWeight = sections.found.reduce((sum, s) => sum + s.weight, 0);
  const sectionScore = Math.min(10, Math.round(totalWeight * 10 / 20));
  score += sectionScore;

  if (sections.found.length >= 10) {
    strengths.push(`${sections.found.length}/14 required sections present`);
  } else if (sections.found.length >= 6) {
    strengths.push(`${sections.found.length}/14 sections present`);
  }
  // Only show top 3 missing sections to avoid overwhelming
  sections.missing.slice(0, 3).forEach(s => {
    issues.push(`Missing section: ${s.name}`);
  });
  if (sections.missing.length > 3) {
    issues.push(`...and ${sections.missing.length - 3} more missing sections`);
  }

  // Document organization (0-5 pts) - check heading hierarchy
  const headings = text.match(/^#+\s+.+$/gm) || [];
  const hasH1 = headings.some(h => h.startsWith('# '));
  const hasH2 = headings.some(h => h.startsWith('## '));

  if (hasH1 && hasH2) {
    score += 3;
    strengths.push('Good heading hierarchy');
  } else if (headings.length > 0) {
    score += 1;
  } else {
    issues.push('No clear heading structure');
  }

  // Check for logical flow (purpose before features, Customer FAQ before Solution)
  const purposeIndex = text.search(/^#+\s*(purpose|introduction|overview)/im);
  const featuresIndex = text.search(/^#+\s*(feature|requirement)/im);
  const customerFAQIndex = text.search(STRATEGIC_VIABILITY_PATTERNS.customerFAQ);
  const solutionIndex = text.search(/^#+\s*(\d+\.?\d*\.?\s*)?(proposed\s+solution|solution)/im);
  if (purposeIndex >= 0 && featuresIndex >= 0 && purposeIndex < featuresIndex) {
    score += 1;
    strengths.push('Logical document flow (context before requirements)');
  }
  if (customerFAQIndex >= 0 && solutionIndex >= 0 && customerFAQIndex < solutionIndex) {
    score += 1;
    strengths.push('Working Backwards: Customer FAQ before Solution');
  }

  // Formatting consistency (0-3 pts) - check for bullet list consistency
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
    score += 1;
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
 * Count functional requirements in text (FR1, FR2, etc.)
 * @param {string} text - Text to analyze
 * @returns {Object} Functional requirements detection results
 */
export function countFunctionalRequirements(text) {
  const frMatches = text.match(FUNCTIONAL_REQ_PATTERN) || [];
  const doorTypeMatches = text.match(DOOR_TYPE_PATTERN) || [];
  const problemLinkMatches = text.match(PROBLEM_LINK_PATTERN) || [];

  // Deduplicate FR IDs (FR1 might appear multiple times)
  const uniqueFRs = [...new Set(frMatches.map(fr => fr.toUpperCase()))];

  return {
    count: uniqueFRs.length,
    hasDoorTypes: doorTypeMatches.length > 0,
    doorTypeCount: doorTypeMatches.length,
    hasProblemLinks: problemLinkMatches.length > 0,
    problemLinkCount: problemLinkMatches.length,
    // Quality score: FRs with door types and problem links are higher quality
    qualityScore: uniqueFRs.length > 0 ? (
      (doorTypeMatches.length > 0 ? 2 : 0) +
      (problemLinkMatches.length > 0 ? 2 : 0) +
      Math.min(uniqueFRs.length, 3)
    ) : 0
  };
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
  const maxScore = 25;

  // Requirement precision (0-7 pts) - comprehensive AI slop and vague language detection
  const vagueQualifiers = detectVagueQualifiers(text);
  const vagueLanguage = detectVagueLanguage(text);
  const slopPenalty = getSlopPenalty(text);

  // Use the more comprehensive slop detection for scoring
  // Slop score of 0 = 7 pts, higher slop = lower score
  const precisionScore = Math.max(0, 7 - slopPenalty.penalty);
  score += precisionScore;

  if (slopPenalty.slopScore === 0) {
    strengths.push('No AI slop or vague language detected');
  } else if (slopPenalty.severity === 'clean') {
    strengths.push('Minimal AI patterns detected');
  } else {
    // Add slop-related issues
    slopPenalty.issues.forEach(issue => issues.push(issue));
  }

  // Completeness of details (0-7 pts) - Functional Requirements with structure
  const frResults = countFunctionalRequirements(text);
  const userStoryCount = countUserStories(text);

  // Prefer FR format (phase1.md standard), but also accept user stories
  if (frResults.count >= 3) {
    // Full points for well-structured FRs with door types and problem links
    if (frResults.hasDoorTypes && frResults.hasProblemLinks) {
      score += 7;
      strengths.push(`${frResults.count} functional requirements with Door Types and Problem Links`);
    } else if (frResults.hasDoorTypes || frResults.hasProblemLinks) {
      score += 5;
      strengths.push(`${frResults.count} functional requirements found`);
      if (!frResults.hasDoorTypes) issues.push('Add Door Type (🚪 One-Way / 🔄 Two-Way) to requirements');
      if (!frResults.hasProblemLinks) issues.push('Link requirements to Problem IDs (P1, P2)');
    } else {
      score += 4;
      strengths.push(`${frResults.count} functional requirements found`);
      issues.push('Enhance FRs with Door Types and Problem Links for traceability');
    }
  } else if (frResults.count >= 1) {
    score += 3;
    strengths.push(`${frResults.count} functional requirement found`);
    issues.push('Add more functional requirements (FR1, FR2, FR3...)');
  } else if (userStoryCount >= 3) {
    // Fallback: accept user stories but suggest FR format
    score += 5;
    strengths.push(`${userStoryCount} user stories found`);
    issues.push('Consider using FR format with ID, Problem Link, Door Type, and AC');
  } else if (userStoryCount >= 1) {
    score += 3;
    strengths.push(`${userStoryCount} user story found`);
    issues.push('Use FR format (FR1, FR2) with Problem Link and Door Type');
  } else {
    // Check for alternative requirement formats
    const requirementPatterns = text.match(/\b(shall|must|should|will)\b/gi) || [];
    if (requirementPatterns.length >= 5) {
      score += 2;
      issues.push('Use FR format: FR1, FR2 with Problem Link (P1), Door Type, and AC');
    } else {
      issues.push('No functional requirements found - use format: FR1, FR2 with Problem Link, Door Type, AC');
    }
  }

  // Measurable criteria (0-6 pts)
  const measurableCount = countMeasurableRequirements(text);

  if (measurableCount >= 5) {
    score += 6;
    strengths.push(`${measurableCount} measurable criteria found`);
  } else if (measurableCount >= 2) {
    score += 4;
    strengths.push(`${measurableCount} measurable criteria found`);
  } else if (measurableCount >= 1) {
    score += 2;
    issues.push('Add more measurable criteria (e.g., response times, percentages, counts)');
  } else {
    issues.push('No measurable criteria - requirements should include specific numbers');
  }

  // Prioritization (0-5 pts)
  const prioritization = detectPrioritization(text);

  if (prioritization.hasPrioritySection && (prioritization.hasMoscow || prioritization.hasPLevel)) {
    score += 5;
    const method = prioritization.hasMoscow ? 'MoSCoW' : 'P-level';
    strengths.push(`Uses ${method} prioritization with dedicated section`);
  } else if (prioritization.hasMoscow || prioritization.hasPLevel) {
    score += 3;
    const method = prioritization.hasMoscow ? 'MoSCoW' : 'P-level';
    strengths.push(`Uses ${method} prioritization`);
  } else if (prioritization.hasTiered || prioritization.totalSignals > 0) {
    score += 1;
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
    functionalRequirements: frResults,
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
  const maxScore = 20;

  // User persona definition (0-5 pts)
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
    score += 5;
    if (personas.userTypes.length >= 2) {
      strengths.push(`${personas.userTypes.length} user types identified with dedicated section`);
    } else {
      strengths.push('Well-defined user persona with pain points and context');
    }
  } else if (personaQuality >= 3) {
    score += 4;
    if (personas.userTypes.length > 0) {
      strengths.push(`User types identified: ${personas.userTypes.slice(0, 3).join(', ')}`);
    }
    if (personas.hasPainPoints) {
      strengths.push('User pain points addressed');
    }
  } else if (personaQuality >= 2) {
    score += 2;
    if (personas.userTypes.length > 0) {
      strengths.push(`User types identified: ${personas.userTypes.slice(0, 3).join(', ')}`);
    }
    issues.push('Add more persona depth (pain points, scenarios, detailed descriptions)');
  } else if (personas.userTypes.length >= 1) {
    score += 1;
    issues.push('Add dedicated User Personas section with detailed descriptions');
  } else {
    issues.push('No user personas found - identify who will use this product');
  }

  // Problem statement (0-5 pts)
  const problem = detectProblemStatement(text);

  if (problem.hasProblemSection && problem.hasValueProp) {
    score += 5;
    strengths.push('Clear problem statement with value proposition');
  } else if (problem.hasProblemLanguage && problem.hasValueProp) {
    score += 3;
    issues.push('Consider adding a dedicated Problem Statement section');
  } else if (problem.hasProblemLanguage || problem.hasValueProp) {
    score += 1;
    issues.push('Strengthen the problem statement and value proposition');
  } else {
    issues.push('Missing problem statement - explain what problem this solves');
  }

  // Alignment between requirements and user needs (0-5 pts)
  // Accept both FR format (preferred) and user stories
  const frResults = countFunctionalRequirements(text);
  const userStoryCount = countUserStories(text);
  const hasStructuredRequirements = frResults.count >= 3 || userStoryCount >= 3;
  const hasSomeRequirements = frResults.count >= 1 || userStoryCount >= 1;

  if (hasStructuredRequirements && problem.hasWhyExplanation) {
    score += 5;
    strengths.push('Requirements clearly linked to user needs');
  } else if (hasSomeRequirements || problem.hasWhyExplanation) {
    score += 2;
    if (!hasSomeRequirements) {
      issues.push('Use FR format (FR1, FR2) to connect features to user needs');
    }
  } else {
    issues.push('Requirements should trace back to user needs');
  }

  // Customer evidence (0-5 pts) - includes Customer FAQ and Aha moment
  const customerEvidence = detectCustomerEvidence(text);
  const hasCustomerFAQ = STRATEGIC_VIABILITY_PATTERNS.customerFAQ.test(text);
  const hasAhaQuote = STRATEGIC_VIABILITY_PATTERNS.ahaQuote.test(text);

  let evidenceScore = 0;
  if (customerEvidence.evidenceTypes >= 3) {
    evidenceScore += 3;
    const types = [];
    if (customerEvidence.hasResearch) types.push('research');
    if (customerEvidence.hasData) types.push('data');
    if (customerEvidence.hasQuotes) types.push('quotes');
    if (customerEvidence.hasFeedback) types.push('feedback');
    strengths.push(`Customer evidence: ${types.join(', ')}`);
  } else if (customerEvidence.evidenceTypes >= 2) {
    evidenceScore += 2;
    strengths.push('Some customer evidence present');
  } else if (customerEvidence.evidenceTypes >= 1) {
    evidenceScore += 1;
    issues.push('Add more customer evidence (research, data, quotes, feedback)');
  } else {
    issues.push('No customer evidence found - include user research, quotes, or usage data');
  }

  // Bonus for Customer FAQ and Aha quote (Working Backwards)
  if (hasCustomerFAQ) {
    evidenceScore += 1;
    strengths.push('Customer FAQ section (Working Backwards approach)');
  }
  if (hasAhaQuote) {
    evidenceScore += 1;
    strengths.push('Customer "Aha!" moment quote included');
  }

  score += Math.min(evidenceScore, 5);

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths,
    personas,
    problem,
    customerEvidence,
    hasCustomerFAQ,
    hasAhaQuote
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
  const maxScore = 15;

  // Non-functional requirements (0-5 pts)
  const nfr = detectNonFunctionalRequirements(text);

  if (nfr.count >= 4 && nfr.hasNFRSection) {
    score += 5;
    strengths.push(`${nfr.count} NFR categories addressed in dedicated section`);
  } else if (nfr.count >= 3) {
    score += 4;
    strengths.push(`${nfr.count} NFR categories mentioned: ${nfr.categories.join(', ')}`);
  } else if (nfr.count >= 1) {
    score += 2;
    issues.push('Add more non-functional requirements (performance, security, reliability)');
  } else {
    issues.push('Missing non-functional requirements - define quality attributes');
  }

  // Acceptance criteria (0-5 pts) - must include BOTH success AND failure/edge cases
  const acceptanceCriteriaCount = countAcceptanceCriteria(text);
  // Detect failure/edge case ACs (per Phase1.md requirement)
  const hasFailureCases = /\b(fail|error|invalid|edge\s+case|exception|timeout|reject|deny|empty|offline|ac\s*\(failure\)|failure\))\b/i.test(text);
  const hasSuccessAndFailure = acceptanceCriteriaCount >= 2 && hasFailureCases;

  if (acceptanceCriteriaCount >= 3 && hasSuccessAndFailure) {
    score += 5;
    strengths.push(`${acceptanceCriteriaCount} acceptance criteria with success AND failure cases`);
  } else if (acceptanceCriteriaCount >= 3) {
    score += 4;
    strengths.push(`${acceptanceCriteriaCount} acceptance criteria in Given/When/Then format`);
    issues.push('Add failure/edge case acceptance criteria (not just happy path)');
  } else if (acceptanceCriteriaCount >= 1) {
    score += 2;
    strengths.push(`${acceptanceCriteriaCount} acceptance criteria found`);
    issues.push('Add more acceptance criteria including failure/edge cases');
  } else {
    // Check for alternative acceptance criteria formats
    const hasCheckboxes = /\[[ x]\]/i.test(text);
    if (hasCheckboxes) {
      score += 1;
      issues.push('Consider using Given/When/Then format for acceptance criteria');
    } else {
      issues.push('No acceptance criteria - add testable verification conditions');
    }
  }

  // Dependencies and constraints (0-5 pts)
  const hasDependencies = /^#+\s*(depend|risk|assumption|constraint)/im.test(text);
  const mentionsDependencies = /\b(depends.?on|requires|prerequisite|blocker|assumption)\b/i.test(text);

  if (hasDependencies && mentionsDependencies) {
    score += 5;
    strengths.push('Dependencies and constraints documented');
  } else if (hasDependencies || mentionsDependencies) {
    score += 2;
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
// Strategic Viability Detection (NEW)
// ============================================================================

/**
 * Score Strategic Viability (20 pts max)
 * Evaluates: Metric Validity, Scope Realism, Risk & Mitigation Quality, Traceability
 * @param {string} text - PRD content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreStrategicViability(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 20;

  // Reset regex lastIndex for global patterns
  const resetPatterns = () => {
    Object.values(STRATEGIC_VIABILITY_PATTERNS).forEach(p => {
      if (p.global) p.lastIndex = 0;
    });
  };
  resetPatterns();

  // Metric Validity (0-6 pts): Leading indicators, counter-metrics, source of truth
  let metricValidityScore = 0;
  const leadingMatches = text.match(STRATEGIC_VIABILITY_PATTERNS.leadingIndicator) || [];
  const counterMatches = text.match(STRATEGIC_VIABILITY_PATTERNS.counterMetric) || [];
  const sourceMatches = text.match(STRATEGIC_VIABILITY_PATTERNS.sourceOfTruth) || [];

  if (leadingMatches.length >= 1) {
    metricValidityScore += 2;
    strengths.push('Leading indicators defined (predictive metrics)');
  } else {
    issues.push('Add leading indicators - metrics that predict success before launch');
  }

  if (counterMatches.length >= 1) {
    metricValidityScore += 2;
    strengths.push('Counter-metrics defined to prevent perverse incentives');
  } else {
    issues.push('Add counter-metrics to guard against unintended consequences');
  }

  if (sourceMatches.length >= 2) {
    metricValidityScore += 2;
    strengths.push('Metrics have defined sources of truth');
  } else if (sourceMatches.length >= 1) {
    metricValidityScore += 1;
    issues.push('Define source of truth for all metrics (e.g., Mixpanel, Datadog)');
  } else {
    issues.push('No metric sources defined - specify where metrics are tracked');
  }

  score += metricValidityScore;

  // Scope Realism (0-5 pts): Scope vs timeline alignment
  let scopeRealismScore = 0;
  const hasKillSwitch = STRATEGIC_VIABILITY_PATTERNS.killSwitch.test(text);
  resetPatterns();
  const hasDoorType = STRATEGIC_VIABILITY_PATTERNS.doorType.test(text);
  resetPatterns();
  const hasAlternatives = STRATEGIC_VIABILITY_PATTERNS.alternativesConsidered.test(text);
  resetPatterns();
  const hasAlternativesContent = STRATEGIC_VIABILITY_PATTERNS.alternativesContent.test(text);
  resetPatterns();

  if (hasKillSwitch) {
    scopeRealismScore += 2;
    strengths.push('Hypothesis kill switch defined (pivot criteria)');
  } else {
    issues.push('Add kill switch - what data would prove this feature is a failure?');
  }

  if (hasDoorType) {
    scopeRealismScore += 2;
    strengths.push('One-way/Two-way door decisions tagged');
  } else {
    issues.push('Tag requirements as One-Way Door 🚪 (irreversible) or Two-Way Door 🔄 (reversible)');
  }

  if (hasAlternatives || hasAlternativesContent) {
    scopeRealismScore += 1;
    strengths.push('Alternatives considered and documented');
  } else {
    issues.push('Add "Alternatives Considered" section with rejected approaches');
  }

  score += scopeRealismScore;

  // Risk & Mitigation Quality (0-5 pts): Specific risks, actionable mitigations
  let riskScore = 0;
  const hasDissentingSection = STRATEGIC_VIABILITY_PATTERNS.dissentingOpinions.test(text);
  resetPatterns();
  const hasDissentingContent = STRATEGIC_VIABILITY_PATTERNS.dissentingContent.test(text);
  resetPatterns();
  const hasRiskSection = /^#+\s*(\d+\.?\d*\.?\s*)?(risk|unknown|assumption)/im.test(text);
  const hasSpecificRisks = /\b(risk\s*:|\brisk\b.*\b(that|if|when)|mitigation\s*:|contingency)/gi.test(text);

  if (hasRiskSection && hasSpecificRisks) {
    riskScore += 3;
    strengths.push('Risks documented with specific mitigations');
  } else if (hasRiskSection || hasSpecificRisks) {
    riskScore += 1;
    issues.push('Add specific mitigations for each identified risk');
  } else {
    issues.push('Add Risk section with specific risks and mitigations');
  }

  if (hasDissentingSection || hasDissentingContent) {
    riskScore += 2;
    strengths.push('Known unknowns and dissenting opinions documented');
  } else {
    issues.push('Document dissenting opinions and unresolved debates');
  }

  score += riskScore;

  // Traceability (0-4 pts): Problem → Requirement → Metric mapping
  let traceabilityScore = 0;
  const hasTraceabilitySection = STRATEGIC_VIABILITY_PATTERNS.traceabilitySection.test(text);
  resetPatterns();
  const traceabilityMatches = text.match(STRATEGIC_VIABILITY_PATTERNS.traceability) || [];

  if (hasTraceabilitySection) {
    traceabilityScore += 2;
    strengths.push('Traceability section present');
  }

  if (traceabilityMatches.length >= 3) {
    traceabilityScore += 2;
    strengths.push('Requirements traceable to problems and metrics');
  } else if (traceabilityMatches.length >= 1) {
    traceabilityScore += 1;
    issues.push('Improve traceability - link each requirement to problem and success metric');
  } else {
    issues.push('Add traceability matrix: Problem ID → Requirement ID → Metric ID');
  }

  score += traceabilityScore;

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths,
    metricValidityScore,
    scopeRealismScore,
    riskScore,
    traceabilityScore,
    details: {
      hasLeadingIndicators: leadingMatches.length >= 1,
      hasCounterMetrics: counterMatches.length >= 1,
      hasSourceOfTruth: sourceMatches.length >= 1,
      hasKillSwitch,
      hasDoorType,
      hasAlternatives: hasAlternatives || hasAlternativesContent,
      hasDissentingOpinions: hasDissentingSection || hasDissentingContent,
      hasTraceability: hasTraceabilitySection || traceabilityMatches.length >= 1
    }
  };
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validate a PRD and return comprehensive scoring results
 * New 5-dimension rubric (100 pts total):
 * - Document Structure: 20 pts
 * - Requirements Clarity: 25 pts
 * - User Focus: 20 pts
 * - Technical Quality: 15 pts
 * - Strategic Viability: 20 pts (NEW)
 * @param {string} text - PRD content
 * @returns {Object} Complete validation results
 */
export function validatePRD(text) {
  if (!text || typeof text !== 'string') {
    return {
      totalScore: 0,
      structure: { score: 0, maxScore: 20, issues: ['No content to validate'], strengths: [] },
      clarity: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      userFocus: { score: 0, maxScore: 20, issues: ['No content to validate'], strengths: [] },
      technical: { score: 0, maxScore: 15, issues: ['No content to validate'], strengths: [] },
      strategicViability: { score: 0, maxScore: 20, issues: ['No content to validate'], strengths: [] }
    };
  }

  const structure = scoreDocumentStructure(text);
  const clarity = scoreRequirementsClarity(text);
  const userFocus = scoreUserFocus(text);
  const technical = scoreTechnicalQuality(text);
  const strategicViability = scoreStrategicViability(text);

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
    structure.score + clarity.score + userFocus.score + technical.score + strategicViability.score - slopDeduction
  );

  return {
    totalScore,
    structure,
    clarity,
    userFocus,
    technical,
    strategicViability,
    // Dimension mappings for app.js compatibility
    dimension1: structure,
    dimension2: clarity,
    dimension3: userFocus,
    dimension4: technical,
    dimension5: strategicViability,
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
