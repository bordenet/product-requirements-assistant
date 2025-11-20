package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestSaveAndLoadProject(t *testing.T) {
	// Use the actual outputs directory
	outputsDir := getOutputsDir()

	// Ensure outputs directory exists
	if err := os.MkdirAll(outputsDir, 0755); err != nil {
		t.Fatalf("Failed to create outputs dir: %v", err)
	}

	testProject := &Project{
		ID:          "test-project-storage-123",
		Title:       "Test Product",
		Description: "Test Description",
		Phase:       1,
		Phases: []Phase{
			{Number: 1, Name: "Phase 1", Prompt: "Test prompt 1"},
			{Number: 2, Name: "Phase 2", Prompt: "Test prompt 2"},
			{Number: 3, Name: "Phase 3", Prompt: "Test prompt 3"},
		},
	}

	// Clean up after test
	defer func() {
		projectPath := filepath.Join(outputsDir, testProject.ID+".json")
		os.Remove(projectPath)
	}()

	// Test save
	if err := saveProject(testProject); err != nil {
		t.Fatalf("Failed to save project: %v", err)
	}

	// Verify file exists
	projectPath := filepath.Join(outputsDir, testProject.ID+".json")
	if _, err := os.Stat(projectPath); os.IsNotExist(err) {
		t.Errorf("Project file was not created: %s", projectPath)
	}

	// Test load
	loadedProject := loadProject(testProject.ID)
	if loadedProject == nil {
		t.Fatal("Failed to load project")
	}

	// Verify loaded data
	if loadedProject.ID != testProject.ID {
		t.Errorf("Expected ID %s, got %s", testProject.ID, loadedProject.ID)
	}
	if loadedProject.Title != testProject.Title {
		t.Errorf("Expected title %s, got %s", testProject.Title, loadedProject.Title)
	}
	if loadedProject.Phase != testProject.Phase {
		t.Errorf("Expected phase %d, got %d", testProject.Phase, loadedProject.Phase)
	}
	if len(loadedProject.Phases) != len(testProject.Phases) {
		t.Errorf("Expected %d phases, got %d", len(testProject.Phases), len(loadedProject.Phases))
	}
}

func TestLoadNonExistentProject(t *testing.T) {
	loadedProject := loadProject("non-existent-project-xyz-999")
	if loadedProject != nil {
		t.Error("Expected nil when loading non-existent project, got project")
	}
}

func TestSavePhaseOutput(t *testing.T) {
	outputsDir := getOutputsDir()

	// Ensure outputs directory exists
	if err := os.MkdirAll(outputsDir, 0755); err != nil {
		t.Fatalf("Failed to create outputs dir: %v", err)
	}

	testProject := &Project{
		ID:    "test-project-phase-123",
		Title: "Test Product",
		Phases: []Phase{
			{Number: 1, Name: "Phase 1", Content: "Phase 1 content"},
			{Number: 2, Name: "Phase 2", Content: ""},
		},
	}

	// Clean up after test - remove all files matching the pattern
	defer func() {
		files, _ := filepath.Glob(filepath.Join(outputsDir, testProject.ID+"_phase1_*.md"))
		for _, f := range files {
			os.Remove(f)
		}
	}()

	if err := savePhaseOutput(testProject, 0); err != nil {
		t.Fatalf("Failed to save phase output: %v", err)
	}

	// Verify file exists (with timestamp pattern)
	files, err := filepath.Glob(filepath.Join(outputsDir, testProject.ID+"_phase1_*.md"))
	if err != nil {
		t.Fatalf("Failed to glob files: %v", err)
	}
	if len(files) == 0 {
		t.Errorf("Phase output file was not created")
		return
	}

	// Read and verify content contains expected text
	content, err := os.ReadFile(files[0])
	if err != nil {
		t.Fatalf("Failed to read phase output: %v", err)
	}

	if !strings.Contains(string(content), "Phase 1 content") {
		t.Errorf("Expected content to contain 'Phase 1 content', got '%s'", string(content))
	}
}

func TestSaveFinalPRD(t *testing.T) {
	outputsDir := getOutputsDir()

	// Ensure outputs directory exists
	if err := os.MkdirAll(outputsDir, 0755); err != nil {
		t.Fatalf("Failed to create outputs dir: %v", err)
	}

	testProject := &Project{
		ID:    "test-project-final-123",
		Title: "Test Product",
		Phases: []Phase{
			{Number: 1, Name: "Phase 1", Content: "Phase 1 content"},
			{Number: 2, Name: "Phase 2", Content: "Phase 2 content"},
			{Number: 3, Name: "Phase 3", Content: "Phase 3 content"},
		},
	}

	// Clean up after test
	defer func() {
		finalPath := filepath.Join(outputsDir, testProject.ID+"_final.md")
		os.Remove(finalPath)
	}()

	if err := saveFinalPRD(testProject); err != nil {
		t.Fatalf("Failed to save final PRD: %v", err)
	}
}

func TestGetDefaultPrompt(t *testing.T) {
	tests := []struct {
		name        string
		phase       string
		expectEmpty bool
	}{
		{name: "claude initial", phase: "claude_initial", expectEmpty: false},
		{name: "gemini review", phase: "gemini_review", expectEmpty: false},
		{name: "claude compare", phase: "claude_compare", expectEmpty: false},
		{name: "unknown phase", phase: "unknown", expectEmpty: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			prompt := getDefaultPrompt(tt.phase)

			if tt.expectEmpty {
				if prompt != "" {
					t.Errorf("expected empty prompt for %s, got %q", tt.phase, prompt)
				}
			} else if prompt == "" {
				t.Errorf("expected non-empty prompt for %s", tt.phase)
			}
		})
	}
}
