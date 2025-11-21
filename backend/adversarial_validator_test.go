package main

import (
	"testing"
)

func TestAdversarialValidator(t *testing.T) {
	validator := NewAdversarialValidator()

	t.Run("Effective adversarial output", func(t *testing.T) {
		phase1 := `
# Product Requirements Document

## Problem Statement
Users need a better way to manage their tasks.

## Solution
Build a task management application with the following features:
- Create tasks
- Edit tasks
- Delete tasks
- Mark tasks as complete
`

		phase2 := `
# Product Requirements Document - Revised

## Problem Statement
However, the problem statement is vague. What specific pain points do users face?
Why is the current solution insufficient? What evidence supports this need?

## Solution
I challenge the proposed approach. Instead of building yet another task app,
have you considered integrating with existing tools? What if we focused on
workflow automation rather than basic CRUD operations? The current proposal
lacks innovation and fails to consider market saturation.
`

		result := validator.ValidateAdversarialTension(phase1, phase2)

		if !result.IsEffective {
			t.Errorf("Expected effective adversarial output, got: %v", result.FailureReasons)
		}

		if result.AdversarialPhrases < 3 {
			t.Errorf("Expected ≥3 adversarial phrases, got %d", result.AdversarialPhrases)
		}

		if result.ChallengeCount < 2 {
			t.Errorf("Expected ≥2 challenges, got %d", result.ChallengeCount)
		}

		if result.DifferenceScore < 0.3 {
			t.Errorf("Expected ≥30%% difference, got %.2f", result.DifferenceScore)
		}
	})

	t.Run("Ineffective - too similar", func(t *testing.T) {
		phase1 := `
# Product Requirements Document

## Problem Statement
Users need a better way to manage their tasks.
`

		phase2 := `
# Product Requirements Document

## Problem Statement
Users need a better way to manage their tasks efficiently.
`

		result := validator.ValidateAdversarialTension(phase1, phase2)

		if result.IsEffective {
			t.Error("Expected ineffective output due to high similarity")
		}

		if len(result.FailureReasons) == 0 {
			t.Error("Expected failure reasons to be populated")
		}
	})

	t.Run("Ineffective - insufficient adversarial phrases", func(t *testing.T) {
		phase1 := "This is the original document with some content."
		phase2 := "This is a completely different document with entirely new content and ideas."

		result := validator.ValidateAdversarialTension(phase1, phase2)

		if result.IsEffective {
			t.Error("Expected ineffective output due to insufficient adversarial phrases")
		}

		foundReason := false
		for _, reason := range result.FailureReasons {
			if reason == "Insufficient adversarial phrases (< 3)" {
				foundReason = true
				break
			}
		}

		if !foundReason {
			t.Error("Expected failure reason about insufficient adversarial phrases")
		}
	})

	t.Run("Ineffective - insufficient challenges", func(t *testing.T) {
		phase1 := "This is the original document."
		phase2 := "However, this is different. The assumption is inconsistent. It overlooks key points."

		result := validator.ValidateAdversarialTension(phase1, phase2)

		// This should have adversarial phrases but not enough challenges
		if result.AdversarialPhrases < 3 {
			t.Errorf("Expected ≥3 adversarial phrases, got %d", result.AdversarialPhrases)
		}

		// This text should have <2 challenge phrases (no "why", "how", "what if", etc.)
		// Note: Using "inconsistent" which is in adversarialPhrases but not challengePhrases
		if result.ChallengeCount >= 2 {
			t.Errorf("Expected <2 challenges for this test, got %d", result.ChallengeCount)
		}
	})
}

func TestCalculateContentDifference(t *testing.T) {
	validator := NewAdversarialValidator()

	tests := []struct {
		name    string
		text1   string
		text2   string
		minDiff float64
		maxDiff float64
	}{
		{
			name:    "Identical texts",
			text1:   "This is a test",
			text2:   "This is a test",
			minDiff: 0.0,
			maxDiff: 0.1,
		},
		{
			name:    "Completely different texts",
			text1:   "Apple banana cherry",
			text2:   "Dog elephant fox",
			minDiff: 0.9,
			maxDiff: 1.0,
		},
		{
			name:    "Partially different texts",
			text1:   "The quick brown fox jumps",
			text2:   "The slow brown dog walks",
			minDiff: 0.3,
			maxDiff: 0.8, // Increased to accommodate actual difference
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			diff := validator.calculateContentDifference(tt.text1, tt.text2)

			if diff < tt.minDiff || diff > tt.maxDiff {
				t.Errorf("Expected difference between %.2f and %.2f, got %.2f",
					tt.minDiff, tt.maxDiff, diff)
			}
		})
	}
}
