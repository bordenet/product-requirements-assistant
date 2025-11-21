package main

import (
	"strings"
)

// AdversarialValidationResult holds the results of adversarial validation
type AdversarialValidationResult struct {
	DifferenceScore      float64  `json:"difference_score"`       // 0.0-1.0, higher = more different
	AdversarialPhrases   int      `json:"adversarial_phrases"`    // Count of adversarial phrases found
	ChallengeCount       int      `json:"challenge_count"`        // Count of direct challenges
	IsEffective          bool     `json:"is_effective"`           // Overall effectiveness assessment
	FailureReasons       []string `json:"failure_reasons"`        // Reasons if not effective
}

// AdversarialValidator validates adversarial tension in Phase 2 outputs
type AdversarialValidator struct {
	adversarialPhrases []string
	challengePhrases   []string
}

// NewAdversarialValidator creates a new adversarial validator
func NewAdversarialValidator() *AdversarialValidator {
	return &AdversarialValidator{
		adversarialPhrases: []string{
			"however", "but", "challenge", "question", "assumption",
			"evidence", "unclear", "vague", "inconsistent", "gap",
			"overlooks", "fails to consider", "lacks", "insufficient",
			"what if", "alternatively", "instead", "rather than",
		},
		challengePhrases: []string{
			"why", "how", "what if", "have you considered",
			"is this", "does this", "can we", "should we",
			"challenge", "question", "unclear", "vague",
		},
	}
}

// ValidateAdversarialTension validates that Phase 2 output has sufficient adversarial tension
func (v *AdversarialValidator) ValidateAdversarialTension(phase1Output, phase2Output string) *AdversarialValidationResult {
	result := &AdversarialValidationResult{
		FailureReasons: []string{},
	}

	// Calculate content difference (simple word-based similarity)
	result.DifferenceScore = v.calculateContentDifference(phase1Output, phase2Output)

	// Detect adversarial language
	result.AdversarialPhrases = v.detectAdversarialLanguage(phase2Output)

	// Count challenges
	result.ChallengeCount = v.countChallenges(phase2Output)

	// Assess overall effectiveness
	result.IsEffective = true

	// Check if difference score is sufficient (≥30% different = ≥0.3 score)
	if result.DifferenceScore < 0.3 {
		result.IsEffective = false
		result.FailureReasons = append(result.FailureReasons, 
			"Phase 2 output is too similar to Phase 1 (< 30% different)")
	}

	// Check if adversarial phrases are sufficient (≥3 required)
	if result.AdversarialPhrases < 3 {
		result.IsEffective = false
		result.FailureReasons = append(result.FailureReasons, 
			"Insufficient adversarial phrases (< 3)")
	}

	// Check if challenges are sufficient (≥2 required)
	if result.ChallengeCount < 2 {
		result.IsEffective = false
		result.FailureReasons = append(result.FailureReasons, 
			"Insufficient direct challenges (< 2)")
	}

	return result
}

// calculateContentDifference calculates semantic difference between two texts
// Returns a score from 0.0 (identical) to 1.0 (completely different)
func (v *AdversarialValidator) calculateContentDifference(text1, text2 string) float64 {
	// Simple word-based difference calculation
	words1 := strings.Fields(strings.ToLower(text1))
	words2 := strings.Fields(strings.ToLower(text2))

	// Create word frequency maps
	freq1 := make(map[string]int)
	freq2 := make(map[string]int)

	for _, word := range words1 {
		freq1[word]++
	}

	for _, word := range words2 {
		freq2[word]++
	}

	// Calculate Jaccard distance (1 - Jaccard similarity)
	intersection := 0
	union := 0

	allWords := make(map[string]bool)
	for word := range freq1 {
		allWords[word] = true
	}
	for word := range freq2 {
		allWords[word] = true
	}

	for word := range allWords {
		count1 := freq1[word]
		count2 := freq2[word]

		if count1 > 0 && count2 > 0 {
			if count1 < count2 {
				intersection += count1
			} else {
				intersection += count2
			}
		}

		if count1 > count2 {
			union += count1
		} else {
			union += count2
		}
	}

	if union == 0 {
		return 0.0
	}

	similarity := float64(intersection) / float64(union)
	return 1.0 - similarity // Return difference, not similarity
}

// detectAdversarialLanguage counts adversarial phrases in the text
func (v *AdversarialValidator) detectAdversarialLanguage(text string) int {
	lowerText := strings.ToLower(text)
	count := 0

	for _, phrase := range v.adversarialPhrases {
		count += strings.Count(lowerText, phrase)
	}

	return count
}

// countChallenges counts direct challenges in the text
func (v *AdversarialValidator) countChallenges(text string) int {
	lowerText := strings.ToLower(text)
	count := 0

	for _, phrase := range v.challengePhrases {
		count += strings.Count(lowerText, phrase)
	}

	return count
}

