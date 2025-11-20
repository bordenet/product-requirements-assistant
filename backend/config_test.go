package main

import (
	"os"
	"testing"
)

func TestLoadConfig(t *testing.T) {
	// Save original env vars
	originalPort := os.Getenv("PORT")
	originalMockAI := os.Getenv("MOCK_AI_ENABLED")
	originalRateLimit := os.Getenv("RATE_LIMIT")

	defer func() {
		os.Setenv("PORT", originalPort)
		os.Setenv("MOCK_AI_ENABLED", originalMockAI)
		os.Setenv("RATE_LIMIT", originalRateLimit)
	}()

	tests := []struct {
		name         string
		envVars      map[string]string
		expectedPort string
		expectedMock bool
		expectedRate int
	}{
		{
			name: "Default values",
			envVars: map[string]string{
				"PORT":            "",
				"MOCK_AI_ENABLED": "",
				"RATE_LIMIT":      "",
			},
			expectedPort: "8080",
			expectedMock: false,
			expectedRate: 100,
		},
		{
			name: "Custom port",
			envVars: map[string]string{
				"PORT":            "9000",
				"MOCK_AI_ENABLED": "",
				"RATE_LIMIT":      "",
			},
			expectedPort: "9000",
			expectedMock: false,
			expectedRate: 100,
		},
		{
			name: "Mock AI enabled",
			envVars: map[string]string{
				"PORT":            "",
				"MOCK_AI_ENABLED": "true",
				"RATE_LIMIT":      "",
			},
			expectedPort: "8080",
			expectedMock: true,
			expectedRate: 100,
		},
		{
			name: "Custom rate limit",
			envVars: map[string]string{
				"PORT":            "",
				"MOCK_AI_ENABLED": "",
				"RATE_LIMIT":      "50",
			},
			expectedPort: "8080",
			expectedMock: false,
			expectedRate: 50,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Set environment variables
			for key, value := range tt.envVars {
				if value == "" {
					os.Unsetenv(key)
				} else {
					os.Setenv(key, value)
				}
			}

			config, err := LoadConfig()
			if err != nil {
				t.Fatalf("LoadConfig() returned error: %v", err)
			}

			if config.Port != tt.expectedPort {
				t.Errorf("Expected port %s, got %s", tt.expectedPort, config.Port)
			}
			if config.MockAIEnabled != tt.expectedMock {
				t.Errorf("Expected MockAIEnabled %v, got %v", tt.expectedMock, config.MockAIEnabled)
			}
			if config.RateLimit != tt.expectedRate {
				t.Errorf("Expected RateLimit %d, got %d", tt.expectedRate, config.RateLimit)
			}
		})
	}
}
