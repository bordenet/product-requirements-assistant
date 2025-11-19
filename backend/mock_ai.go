package main

import (
	"fmt"
	"log"
	"time"
)

var mockAI *MockAIGenerator

// InitMockAI initializes the global mock AI generator
func InitMockAI(enabled bool) {
	mockAI = NewMockAIGenerator(enabled)
	if enabled {
		log.Printf("Mock AI enabled - automated response generation available")
	}
}

// GetMockAI returns the global mock AI generator
func GetMockAI() *MockAIGenerator {
	return mockAI
}

// MockAIGenerator generates realistic AI responses for testing
type MockAIGenerator struct {
	enabled bool
}

// NewMockAIGenerator creates a new mock AI generator
func NewMockAIGenerator(enabled bool) *MockAIGenerator {
	return &MockAIGenerator{enabled: enabled}
}

// IsEnabled returns whether mock AI is enabled
func (m *MockAIGenerator) IsEnabled() bool {
	return m.enabled
}

// GeneratePhase1Response generates a mock Claude initial PRD response
func (m *MockAIGenerator) GeneratePhase1Response(title, problems, context string) string {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	return fmt.Sprintf(phase1Template, title, timestamp, title, problems, problems)
}

// GeneratePhase2Response generates a mock Gemini review response
func (m *MockAIGenerator) GeneratePhase2Response(title, phase1Content string) string {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	return fmt.Sprintf(phase2Template, title, timestamp, title)
}

// GeneratePhase3Response generates a mock Claude final synthesis response
func (m *MockAIGenerator) GeneratePhase3Response(title, phase1Content, phase2Content string) string {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	return fmt.Sprintf(phase3Template, title, timestamp, title, timestamp)
}
