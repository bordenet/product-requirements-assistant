package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

// AppConfig holds application configuration
type AppConfig struct {
	Port           string
	AllowedOrigins []string
	MaxRequestSize int64
	RateLimit      int
	LogLevel       string
	Environment    string
	MockAIEnabled  bool
}

// LoadConfig loads and validates configuration from environment variables
func LoadConfig() (*AppConfig, error) {
	config := &AppConfig{
		// Set defaults
		Port:           "8080",
		AllowedOrigins: []string{"http://localhost:8501"},
		MaxRequestSize: 10 * 1024 * 1024, // 10MB
		RateLimit:      100,              // requests per minute
		LogLevel:       "INFO",
		Environment:    "development",
	}

	// Load port
	if port := os.Getenv("PORT"); port != "" {
		config.Port = port
	}

	// Load and validate allowed origins
	if origins := os.Getenv("ALLOWED_ORIGINS"); origins != "" {
		config.AllowedOrigins = strings.Split(origins, ",")
		for i, origin := range config.AllowedOrigins {
			config.AllowedOrigins[i] = strings.TrimSpace(origin)
		}
	}

	// Load and validate max request size
	if maxSize := os.Getenv("MAX_REQUEST_SIZE"); maxSize != "" {
		size, err := strconv.ParseInt(maxSize, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("invalid MAX_REQUEST_SIZE: %v", err)
		}
		if size < 1024 || size > 100*1024*1024 { // 1KB to 100MB range
			return nil, fmt.Errorf("MAX_REQUEST_SIZE must be between 1KB and 100MB")
		}
		config.MaxRequestSize = size
	}

	// Load and validate rate limit
	if rateLimit := os.Getenv("RATE_LIMIT"); rateLimit != "" {
		limit, err := strconv.Atoi(rateLimit)
		if err != nil {
			return nil, fmt.Errorf("invalid RATE_LIMIT: %v", err)
		}
		if limit < 1 || limit > 10000 {
			return nil, fmt.Errorf("RATE_LIMIT must be between 1 and 10000")
		}
		config.RateLimit = limit
	}

	// Load log level
	if logLevel := os.Getenv("LOG_LEVEL"); logLevel != "" {
		validLevels := map[string]bool{
			"DEBUG": true,
			"INFO":  true,
			"WARN":  true,
			"ERROR": true,
		}
		if !validLevels[strings.ToUpper(logLevel)] {
			return nil, fmt.Errorf("invalid LOG_LEVEL: must be DEBUG, INFO, WARN, or ERROR")
		}
		config.LogLevel = strings.ToUpper(logLevel)
	}

	// Load environment
	if env := os.Getenv("ENVIRONMENT"); env != "" {
		validEnvs := map[string]bool{
			"development": true,
			"staging":     true,
			"production":  true,
		}
		if !validEnvs[strings.ToLower(env)] {
			return nil, fmt.Errorf("invalid ENVIRONMENT: must be development, staging, or production")
		}
		config.Environment = strings.ToLower(env)
	}

	// Load mock AI setting
	if mockAI := os.Getenv("MOCK_AI_ENABLED"); mockAI != "" {
		config.MockAIEnabled = strings.ToLower(mockAI) == "true" || mockAI == "1"
	}

	return config, nil
}

// ValidateDirectoryStructure validates required directories exist and are writable
func ValidateDirectoryStructure() error {
	workDir, err := os.Getwd()
	if err != nil {
		return fmt.Errorf("failed to get working directory: %v", err)
	}

	projectRoot := filepath.Dir(workDir)
	requiredDirs := map[string]string{
		"inputs":  filepath.Join(projectRoot, "inputs"),
		"outputs": filepath.Join(projectRoot, "outputs"),
		"prompts": filepath.Join(projectRoot, "prompts"),
	}

	for name, path := range requiredDirs {
		// Check if directory exists
		info, err := os.Stat(path)
		if err != nil {
			if os.IsNotExist(err) {
				// Try to create the directory
				if err := os.MkdirAll(path, 0755); err != nil {
					return fmt.Errorf("failed to create %s directory at %s: %v", name, path, err)
				}
				log.Printf("Created %s directory at %s", name, path)
			} else {
				return fmt.Errorf("error accessing %s directory at %s: %v", name, path, err)
			}
		} else if !info.IsDir() {
			return fmt.Errorf("%s path exists but is not a directory: %s", name, path)
		}

		// Test write permissions
		testFile := filepath.Join(path, ".write_test")
		if err := os.WriteFile(testFile, []byte("test"), 0644); err != nil {
			return fmt.Errorf("%s directory is not writable: %s", name, path)
		}
		os.Remove(testFile) // Clean up test file
	}

	return nil
}

// ValidatePromptFiles validates that required prompt files exist
func ValidatePromptFiles() error {
	promptsDir := getPromptsDir()
	requiredPrompts := []string{
		"claude_initial.txt",
		"gemini_review.txt",
		"claude_compare.txt",
	}

	for _, promptFile := range requiredPrompts {
		path := filepath.Join(promptsDir, promptFile)
		if _, err := os.Stat(path); os.IsNotExist(err) {
			log.Printf("Warning: Prompt file %s not found, will use default", promptFile)
		} else if err != nil {
			return fmt.Errorf("error accessing prompt file %s: %v", path, err)
		}
	}

	return nil
}

// ValidateSystemResources validates system resources and limits
func ValidateSystemResources() error {
	// Check available disk space (basic check)
	outputsDir := getOutputsDir()
	if _, err := os.Stat(outputsDir); err != nil {
		return fmt.Errorf("outputs directory not accessible: %v", err)
	}

	// Test file creation
	testFile := filepath.Join(outputsDir, ".startup_test")
	testData := make([]byte, 1024) // 1KB test
	if err := os.WriteFile(testFile, testData, 0644); err != nil {
		return fmt.Errorf("insufficient disk space or write permissions: %v", err)
	}
	os.Remove(testFile)

	return nil
}

// PrintConfiguration logs the current configuration
func PrintConfiguration(config *AppConfig) {
	log.Printf("=== Product Requirements Assistant Configuration ===")
	log.Printf("Environment: %s", config.Environment)
	log.Printf("Port: %s", config.Port)
	log.Printf("Allowed Origins: %v", config.AllowedOrigins)
	log.Printf("Max Request Size: %d bytes (%.2f MB)", config.MaxRequestSize, float64(config.MaxRequestSize)/(1024*1024))
	log.Printf("Rate Limit: %d requests/minute", config.RateLimit)
	log.Printf("Log Level: %s", config.LogLevel)
	log.Printf("Mock AI: %v", config.MockAIEnabled)
	log.Printf("================================================")
}
