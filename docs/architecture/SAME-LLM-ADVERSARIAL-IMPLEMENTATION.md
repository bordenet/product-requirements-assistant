# Same-LLM Adversarial Configuration Implementation

## Overview

This document describes the implementation of same-LLM adversarial configuration for the Product Requirements Assistant. When Phase 1 and Phase 2 use the same LLM, the system automatically augments Phase 2 prompts with Gemini personality simulation to maintain adversarial tension.

## Implementation Details

### 1. Same-LLM Detection

**Location**: `backend/handlers.go` (lines 459-494)

The system detects when Phase 1 and Phase 2 use the same LLM through three methods:

1. **Provider + Model Match**: Checks if both `provider` and `model` fields match (e.g., both "anthropic/claude-3-sonnet")
2. **URL Match**: Checks if both LLM configurations use the same URL (e.g., "https://librechat.company.com/api/chat")
3. **Endpoint Match**: Checks if both configurations use the same endpoint (e.g., "localhost:3000")

```go
func isSameLLM(phase1LLM, phase2LLM *LLMConfig) bool {
    // Returns true if any of the above conditions match
}
```

### 2. Gemini Simulation Template

**Location**: `backend/handlers.go` (lines 496-529)

When same-LLM is detected, the system prepends a Gemini personality simulation to Phase 2 prompts. This template instructs the LLM to adopt Gemini's analytical, constructively adversarial approach.

Key characteristics:
- Challenges assumptions and vague language
- Demands evidence and quantification
- Offers alternative perspectives
- Maintains professional, constructive tone

### 3. Prompt Augmentation

**Location**: `backend/handlers.go` (lines 531-553)

The augmentation logic inserts the Gemini simulation **AFTER** the "Forget all previous sessions" clause to preserve effectiveness. This ensures the LLM doesn't forget the simulation instructions.

Supported forget clause variations:
- "Forget all previous sessions and context."
- "Forget our previous sessions-- start fresh with me."

### 4. Adversarial Validation

**Location**: `backend/adversarial_validator.go`

The system includes validation metrics to ensure Phase 2 outputs maintain adversarial tension:

- **Difference Score**: Phase 2 output must be ≥30% semantically different from Phase 1
- **Adversarial Phrases**: Phase 2 must include ≥3 adversarial phrases ("however", "but", "challenge", etc.)
- **Challenge Count**: Phase 2 must make ≥2 direct challenges ("why", "how", "what if", etc.)

## Data Model Changes

**Location**: `backend/models.go`

Added `LLMConfig` struct and optional fields to `Project` and `CreateProjectRequest`:

```go
type LLMConfig struct {
    Provider string `json:"provider"` // e.g., "anthropic", "google", "openai"
    Model    string `json:"model"`    // e.g., "claude-3-sonnet", "gemini-2.5-pro"
    URL      string `json:"url"`      // e.g., "https://librechat.company.com/api/chat"
    Endpoint string `json:"endpoint"` // e.g., "localhost:3000"
}

type Project struct {
    // ... existing fields ...
    Phase1LLM *LLMConfig `json:"phase1_llm,omitempty"`
    Phase2LLM *LLMConfig `json:"phase2_llm,omitempty"`
}
```

## Test Coverage

**Location**: `backend/handlers_test.go` (lines 905-1130)

Comprehensive test suite covering:

1. **Same-LLM Detection Tests** (9 test cases)
   - Both nil configurations
   - One nil configuration
   - Same provider+model
   - Different provider, same model
   - Same provider, different model
   - Same URL
   - Different URL
   - Same endpoint
   - Different endpoint

2. **Gemini Simulation Augmentation Test**
   - Verifies Gemini simulation is added when same LLM detected
   - Verifies simulation comes AFTER forget clause
   - Verifies prompt contains required behavioral profile

3. **Different LLM No Augmentation Test**
   - Verifies Gemini simulation is NOT added when different LLMs used

**Location**: `backend/adversarial_validator_test.go`

Adversarial validation tests covering:

1. **Effective Adversarial Output**
   - Validates all metrics pass for good adversarial content

2. **Ineffective - Too Similar**
   - Validates failure when Phase 2 is too similar to Phase 1

3. **Ineffective - Insufficient Adversarial Phrases**
   - Validates failure when <3 adversarial phrases

4. **Ineffective - Insufficient Challenges**
   - Validates failure when <2 direct challenges

5. **Content Difference Calculation**
   - Tests Jaccard distance calculation for semantic difference

## Success Criteria

All success criteria have been met:

✅ **Same-LLM Configuration Automatically Detected**
- Detection works via provider+model, URL, or endpoint matching

✅ **Gemini Simulation Applied to Phase 2 When Needed**
- Simulation template is prepended when same LLM detected
- Simulation is inserted AFTER forget clause to preserve effectiveness

✅ **Adversarial Tension Maintained in Outputs**
- Validation metrics ensure ≥30% difference, ≥3 adversarial phrases, ≥2 challenges

✅ **Quality Improvements Preserved Despite Single LLM Usage**
- Gemini behavioral profile maintains review quality even with same LLM

## Testing Results

```
✅ All tests passing (100% pass rate)
✅ Linting clean (0 errors)
✅ Same-LLM detection: 9/9 tests passing
✅ Gemini simulation augmentation: 1/1 test passing
✅ Different LLM no augmentation: 1/1 test passing
✅ Adversarial validation: 5/5 tests passing
```

## Files Modified

- `backend/models.go` - Added LLMConfig struct and Phase1LLM/Phase2LLM fields
- `backend/handlers.go` - Added same-LLM detection, Gemini simulation, and prompt augmentation
- `backend/handlers_test.go` - Added comprehensive test coverage for same-LLM scenarios

## Files Created

- `backend/adversarial_validator.go` - Adversarial validation logic
- `backend/adversarial_validator_test.go` - Adversarial validation tests
- `docs/cross-project-prompts/PROMPT-FOR-CLAUDE-IN-ONE-PAGER-REPO.md` - Prompt for upgrading one-pager repo
- `docs/cross-project-prompts/PROMPT-FOR-CLAUDE-IN-GENESIS-REPO.md` - Prompt for implementing in Genesis repo
- `docs/architecture/SAME-LLM-ADVERSARIAL-IMPLEMENTATION.md` - This document

## References

- **Design Spec**: https://github.com/bordenet/one-pager/blob/main/SAME_LLM_ADVERSARIAL_DESIGN_SPEC.md
- **One-Pager Implementation**: Referenced for same-LLM detection and Gemini simulation patterns

