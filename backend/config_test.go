package main

import (
	"os"
	"path/filepath"
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

func TestLoadConfig_InvalidMaxRequestSize(t *testing.T) {
	// Non-numeric MAX_REQUEST_SIZE should return an error
	t.Setenv("MAX_REQUEST_SIZE", "not-a-number")

	if _, err := LoadConfig(); err == nil {
		t.Fatal("expected error for invalid MAX_REQUEST_SIZE, got nil")
	}
}

func TestLoadConfig_MaxRequestSizeOutOfRange(t *testing.T) {
	// Too small MAX_REQUEST_SIZE should be rejected
	t.Setenv("MAX_REQUEST_SIZE", "512") // 512 bytes

	if _, err := LoadConfig(); err == nil {
		t.Fatal("expected error for out-of-range MAX_REQUEST_SIZE, got nil")
	}
}

func TestLoadConfig_InvalidRateLimit(t *testing.T) {
	t.Setenv("RATE_LIMIT", "not-a-number")

	if _, err := LoadConfig(); err == nil {
		t.Fatal("expected error for invalid RATE_LIMIT, got nil")
	}
}

func TestLoadConfig_RateLimitOutOfRange(t *testing.T) {
	t.Setenv("RATE_LIMIT", "0")

	if _, err := LoadConfig(); err == nil {
		t.Fatal("expected error for out-of-range RATE_LIMIT, got nil")
	}
}

func TestLoadConfig_InvalidLogLevel(t *testing.T) {
	t.Setenv("LOG_LEVEL", "verbose")

	if _, err := LoadConfig(); err == nil {
		t.Fatal("expected error for invalid LOG_LEVEL, got nil")
	}
}

func TestLoadConfig_InvalidEnvironment(t *testing.T) {
	t.Setenv("ENVIRONMENT", "qa")

	if _, err := LoadConfig(); err == nil {
		t.Fatal("expected error for invalid ENVIRONMENT, got nil")
	}
}

func withTestProjectRoot(t *testing.T, root string) func() {
	t.Helper()

	initializePaths()

	originalInputs := projectPaths.inputs
	originalOutputs := projectPaths.outputs
	originalPrompts := projectPaths.prompts

	projectPaths.inputs = filepath.Join(root, "inputs")
	projectPaths.outputs = filepath.Join(root, "outputs")
	projectPaths.prompts = filepath.Join(root, "prompts")

	return func() {
		projectPaths.inputs = originalInputs
		projectPaths.outputs = originalOutputs
		projectPaths.prompts = originalPrompts
	}
}

func TestValidateDirectoryStructure_CreatesDirectories(t *testing.T) {
	originalDir, err := os.Getwd()
	if err != nil {
		t.Fatalf("failed to get working directory: %v", err)
	}
	defer os.Chdir(originalDir)

	tempRoot := t.TempDir()
	workDir := filepath.Join(tempRoot, "backend")
	if err := os.MkdirAll(workDir, 0o755); err != nil {
		t.Fatalf("failed to create temp backend dir: %v", err)
	}

	if err := os.Chdir(workDir); err != nil {
		t.Fatalf("failed to change working directory: %v", err)
	}

	if err := ValidateDirectoryStructure(); err != nil {
		t.Fatalf("ValidateDirectoryStructure() returned error: %v", err)
	}

	for _, dirName := range []string{"inputs", "outputs", "prompts"} {
		dirPath := filepath.Join(tempRoot, dirName)
		info, err := os.Stat(dirPath)
		if err != nil {
			t.Errorf("expected %s directory to exist: %v", dirName, err)
			continue
		}
		if !info.IsDir() {
			t.Errorf("expected %s to be a directory", dirPath)
		}

		if _, err := os.Stat(filepath.Join(dirPath, ".write_test")); err == nil {
			t.Errorf(".write_test should be removed in %s", dirPath)
		}
	}
}

func TestValidateDirectoryStructure_ErrorsWhenPathIsFile(t *testing.T) {
	originalDir, err := os.Getwd()
	if err != nil {
		t.Fatalf("failed to get working directory: %v", err)
	}
	defer os.Chdir(originalDir)

	tempRoot := t.TempDir()
	workDir := filepath.Join(tempRoot, "backend")
	if err := os.MkdirAll(workDir, 0o755); err != nil {
		t.Fatalf("failed to create temp backend dir: %v", err)
	}

	if err := os.Chdir(workDir); err != nil {
		t.Fatalf("failed to change working directory: %v", err)
	}

	inputsPath := filepath.Join(tempRoot, "inputs")
	if err := os.WriteFile(inputsPath, []byte("not a directory"), 0o644); err != nil {
		t.Fatalf("failed to write inputs file: %v", err)
	}

	if err := ValidateDirectoryStructure(); err == nil {
		t.Fatal("expected error when inputs path is a file, got nil")
	}
}

func TestValidatePromptFiles_WithAndWithoutPromptFiles(t *testing.T) {
	tempRoot := t.TempDir()
	cleanup := withTestProjectRoot(t, tempRoot)
	defer cleanup()

	// No prompt files present should not be an error (defaults are used)
	if err := ValidatePromptFiles(); err != nil {
		t.Fatalf("ValidatePromptFiles() with missing prompts returned error: %v", err)
	}

	promptsDir := filepath.Join(tempRoot, "prompts")
	if err := os.MkdirAll(promptsDir, 0o755); err != nil {
		t.Fatalf("failed to create prompts dir: %v", err)
	}

	for _, name := range []string{"claude_initial.txt", "gemini_review.txt", "claude_compare.txt"} {
		if err := os.WriteFile(filepath.Join(promptsDir, name), []byte("prompt"), 0o644); err != nil {
			t.Fatalf("failed to write prompt file %s: %v", name, err)
		}
	}

	if err := ValidatePromptFiles(); err != nil {
		t.Fatalf("ValidatePromptFiles() with existing prompts returned error: %v", err)
	}
}

func TestValidateSystemResources(t *testing.T) {
	tempRoot := t.TempDir()
	cleanup := withTestProjectRoot(t, tempRoot)
	defer cleanup()

	outputsDir := filepath.Join(tempRoot, "outputs")
	if err := os.MkdirAll(outputsDir, 0o755); err != nil {
		t.Fatalf("failed to create outputs dir: %v", err)
	}

	if err := ValidateSystemResources(); err != nil {
		t.Fatalf("ValidateSystemResources() returned error: %v", err)
	}

	if _, err := os.Stat(filepath.Join(outputsDir, ".startup_test")); err == nil {
		t.Errorf(".startup_test should be removed after validation")
	}
}

func TestValidateSystemResources_MissingOutputsDir(t *testing.T) {
	tempRoot := t.TempDir()
	cleanup := withTestProjectRoot(t, tempRoot)
	defer cleanup()

	if err := ValidateSystemResources(); err == nil {
		t.Fatal("expected error when outputs directory does not exist, got nil")
	}
}

func TestPrintConfiguration_DoesNotPanic(t *testing.T) {
	config := &AppConfig{
		Port:           "8080",
		AllowedOrigins: []string{"http://localhost:8501"},
		MaxRequestSize: 1024,
		RateLimit:      100,
		LogLevel:       "INFO",
		Environment:    "development",
		MockAIEnabled:  true,
	}

	PrintConfiguration(config)
}
