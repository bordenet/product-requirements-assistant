package main

import (
	"fmt"
	"html"
	"regexp"
	"strings"
	"unicode"
)

// InputValidator handles input validation and sanitization
type InputValidator struct {
	maxTitleLength    int
	maxProblemsLength int
	maxContextLength  int
	maxContentLength  int
	forbiddenPatterns []*regexp.Regexp
	allowedHTMLTags   map[string]bool
}

// NewInputValidator creates a new input validator with default settings
func NewInputValidator() *InputValidator {
	// Compile forbidden patterns (actual security risks only)
	// These patterns look for HTML tags with specific characters that indicate actual code injection
	forbiddenPatterns := []*regexp.Regexp{
		regexp.MustCompile(`<script[^>]*>.*?</script>`),      // Script tags
		regexp.MustCompile(`javascript:\s*[a-zA-Z]`),         // JavaScript URLs (must have code after)
		regexp.MustCompile(`<\s*\w+[^>]*\son\w+\s*=\s*["']`), // Event handlers in actual HTML tags
		regexp.MustCompile(`<iframe[^>]*>.*?</iframe>`),      // Iframes
		regexp.MustCompile(`<object[^>]*>.*?</object>`),      // Objects
		regexp.MustCompile(`<embed[^>]*>`),                   // Embeds
	}

	// Allowed HTML tags for content (basic formatting only)
	allowedTags := map[string]bool{
		"p":          true,
		"br":         true,
		"strong":     true,
		"em":         true,
		"ul":         true,
		"ol":         true,
		"li":         true,
		"h1":         true,
		"h2":         true,
		"h3":         true,
		"h4":         true,
		"h5":         true,
		"h6":         true,
		"code":       true,
		"pre":        true,
		"a":          true,
		"blockquote": true,
	}

	return &InputValidator{
		maxTitleLength:    200,
		maxProblemsLength: 100000, // Increased to 100KB to accommodate large PRD inputs
		maxContextLength:  50000,  // Increased to 50KB for additional context
		maxContentLength:  200000, // Increased to 200KB for PRD content
		forbiddenPatterns: forbiddenPatterns,
		allowedHTMLTags:   allowedTags,
	}
}

// ValidateCreateProjectRequest validates and sanitizes project creation input
func (v *InputValidator) ValidateCreateProjectRequest(req *CreateProjectRequest) error {
	// Validate and sanitize title
	if strings.TrimSpace(req.Title) == "" {
		return fmt.Errorf("title is required")
	}

	req.Title = v.sanitizeString(req.Title)
	if len(req.Title) > v.maxTitleLength {
		return fmt.Errorf("title must be less than %d characters", v.maxTitleLength)
	}

	// Validate and sanitize problems
	if strings.TrimSpace(req.Problems) == "" {
		return fmt.Errorf("problems description is required")
	}

	req.Problems = v.sanitizeString(req.Problems)
	if len(req.Problems) > v.maxProblemsLength {
		return fmt.Errorf("problems description must be less than %d characters", v.maxProblemsLength)
	}

	// Validate and sanitize context (optional)
	req.Context = v.sanitizeString(req.Context)
	if len(req.Context) > v.maxContextLength {
		return fmt.Errorf("context must be less than %d characters", v.maxContextLength)
	}

	// Check for malicious patterns
	if err := v.checkForbiddenPatterns(req.Title); err != nil {
		return fmt.Errorf("title contains forbidden content: %v", err)
	}
	if err := v.checkForbiddenPatterns(req.Problems); err != nil {
		return fmt.Errorf("problems description contains forbidden content: %v", err)
	}
	if err := v.checkForbiddenPatterns(req.Context); err != nil {
		return fmt.Errorf("context contains forbidden content: %v", err)
	}

	return nil
}

// ValidateUpdatePhaseRequest validates and sanitizes phase update input
func (v *InputValidator) ValidateUpdatePhaseRequest(req *UpdatePhaseRequest) error {
	// Validate content is not empty
	if strings.TrimSpace(req.Content) == "" {
		return fmt.Errorf("content is required")
	}

	// Check length limits
	if len(req.Content) > v.maxContentLength {
		return fmt.Errorf("content must be less than %d characters", v.maxContentLength)
	}

	// Sanitize content (less aggressive for PRD content)
	req.Content = v.sanitizeContent(req.Content)

	// Check for malicious patterns
	if err := v.checkForbiddenPatterns(req.Content); err != nil {
		return fmt.Errorf("content contains forbidden content: %v", err)
	}

	return nil
}

// ValidatePromptUpdate validates prompt update input
func (v *InputValidator) ValidatePromptUpdate(req *PromptUpdate) error {
	if strings.TrimSpace(req.Content) == "" {
		return fmt.Errorf("prompt content is required")
	}

	if len(req.Content) > v.maxContentLength {
		return fmt.Errorf("prompt content must be less than %d characters", v.maxContentLength)
	}

	// Sanitize prompt content
	req.Content = v.sanitizeContent(req.Content)

	// Check for malicious patterns
	if err := v.checkForbiddenPatterns(req.Content); err != nil {
		return fmt.Errorf("prompt content contains forbidden content: %v", err)
	}

	return nil
}

// sanitizeString performs basic string sanitization
func (v *InputValidator) sanitizeString(input string) string {
	// Trim whitespace
	input = strings.TrimSpace(input)

	// Remove null bytes
	input = strings.ReplaceAll(input, "\x00", "")

	// Remove control characters except newlines and tabs
	var result strings.Builder
	for _, r := range input {
		if unicode.IsControl(r) && r != '\n' && r != '\r' && r != '\t' {
			continue
		}
		result.WriteRune(r)
	}

	// HTML escape for basic protection
	return html.EscapeString(result.String())
}

// sanitizeContent performs content sanitization (less aggressive for PRD content)
func (v *InputValidator) sanitizeContent(input string) string {
	// Trim whitespace
	input = strings.TrimSpace(input)

	// Remove null bytes
	input = strings.ReplaceAll(input, "\x00", "")

	// Remove control characters except common whitespace
	var result strings.Builder
	for _, r := range input {
		if unicode.IsControl(r) && r != '\n' && r != '\r' && r != '\t' {
			continue
		}
		result.WriteRune(r)
	}

	// Don't HTML escape content as it may contain legitimate markdown
	return result.String()
}

// checkForbiddenPatterns checks for potentially malicious patterns
func (v *InputValidator) checkForbiddenPatterns(input string) error {
	lowerInput := strings.ToLower(input)

	for _, pattern := range v.forbiddenPatterns {
		if pattern.MatchString(lowerInput) {
			return fmt.Errorf("contains forbidden pattern: %s", pattern.String())
		}
	}

	return nil
}

// ValidatePhaseNumber validates phase numbers
func (v *InputValidator) ValidatePhaseNumber(phase string) (int, error) {
	switch phase {
	case "1":
		return 1, nil
	case "2":
		return 2, nil
	case "3":
		return 3, nil
	default:
		return 0, fmt.Errorf("invalid phase number: must be 1, 2, or 3")
	}
}

// ValidateProjectID validates project ID format
func (v *InputValidator) ValidateProjectID(id string) error {
	if id == "" {
		return fmt.Errorf("project ID is required")
	}

	// Check for basic UUID format (simplified)
	uuidPattern := regexp.MustCompile(`^[a-f0-9-]{36}$`)
	if !uuidPattern.MatchString(id) {
		return fmt.Errorf("invalid project ID format")
	}

	return nil
}

// ValidatePromptPhase validates prompt phase names
func (v *InputValidator) ValidatePromptPhase(phase string) error {
	validPhases := map[string]bool{
		"claude_initial": true,
		"gemini_review":  true,
		"claude_compare": true,
	}

	if !validPhases[phase] {
		return fmt.Errorf("invalid prompt phase: must be claude_initial, gemini_review, or claude_compare")
	}

	return nil
}

// Global validator instance
var globalValidator *InputValidator

// GetValidator returns the global validator instance
func GetValidator() *InputValidator {
	if globalValidator == nil {
		globalValidator = NewInputValidator()
	}
	return globalValidator
}
