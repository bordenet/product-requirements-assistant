package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/gorilla/mux"
)

func TestMockAIGenerator(t *testing.T) {
	mockAI := NewMockAIGenerator(true)

	t.Run("IsEnabled", func(t *testing.T) {
		if !mockAI.IsEnabled() {
			t.Error("Mock AI should be enabled")
		}
	})

	t.Run("GeneratePhase1Response", func(t *testing.T) {
		title := "Test Product"
		problems := "Users need a better solution"
		context := "Enterprise environment"

		response := mockAI.GeneratePhase1Response(title, problems, context)

		if response == "" {
			t.Error("Phase 1 response should not be empty")
		}
		if !strings.Contains(response, title) {
			t.Errorf("Phase 1 response should contain title: %s", title)
		}
		if !strings.Contains(response, "Product Requirements Document") {
			t.Error("Phase 1 response should be a PRD")
		}
		if !strings.Contains(response, "Claude Sonnet 4.5") {
			t.Error("Phase 1 response should indicate Claude model")
		}
	})

	t.Run("GeneratePhase2Response", func(t *testing.T) {
		title := "Test Product"
		phase1Content := "# PRD\n\nThis is a test PRD with features and requirements."

		response := mockAI.GeneratePhase2Response(title, phase1Content)

		if response == "" {
			t.Error("Phase 2 response should not be empty")
		}
		if !strings.Contains(response, title) {
			t.Errorf("Phase 2 response should contain title: %s", title)
		}
		if !strings.Contains(response, "Review") {
			t.Error("Phase 2 response should be a review")
		}
		if !strings.Contains(response, "Gemini 2.5 Pro") {
			t.Error("Phase 2 response should indicate Gemini model")
		}
	})

	t.Run("GeneratePhase3Response", func(t *testing.T) {
		title := "Test Product"
		phase1Content := "# Initial PRD\n\nFeatures and requirements."
		phase2Content := "# Review\n\nStrengths and weaknesses."

		response := mockAI.GeneratePhase3Response(title, phase1Content, phase2Content)

		if response == "" {
			t.Error("Phase 3 response should not be empty")
		}
		if !strings.Contains(response, title) {
			t.Errorf("Phase 3 response should contain title: %s", title)
		}
		if !strings.Contains(response, "Final") {
			t.Error("Phase 3 response should be a final PRD")
		}
		if !strings.Contains(response, "Claude Sonnet 4.5") {
			t.Error("Phase 3 response should indicate Claude model")
		}
	})
}

func TestGenerateMockResponseEndpoint(t *testing.T) {
	// Set up test environment
	os.Setenv("MOCK_AI_ENABLED", "true")
	defer os.Unsetenv("MOCK_AI_ENABLED")

	// Initialize mock AI
	InitMockAI(true)

	// Create a test project with valid UUID
	testProjectID := "550e8400-e29b-41d4-a716-446655440000"
	project := &Project{
		ID:          testProjectID,
		Title:       "AI Chat Widget",
		Description: "Users need an AI-powered chat widget",
		Phase:       1,
		Phases: []Phase{
			{Number: 1, Name: "Claude Initial PRD"},
			{Number: 2, Name: "Gemini Review"},
			{Number: 3, Name: "Claude Comparison"},
		},
	}
	projects[project.ID] = project

	t.Run("GeneratePhase1", func(t *testing.T) {
		router := mux.NewRouter()
		router.HandleFunc("/api/projects/{id}/generate/{phase}", generateMockResponse).Methods("POST")

		req, _ := http.NewRequest("POST", "/api/projects/"+testProjectID+"/generate/1", nil)
		rr := httptest.NewRecorder()

		router.ServeHTTP(rr, req)

		if status := rr.Code; status != http.StatusOK {
			t.Errorf("Handler returned wrong status code: got %v want %v. Body: %s", status, http.StatusOK, rr.Body.String())
		}

		var updatedProject Project
		if err := json.NewDecoder(rr.Body).Decode(&updatedProject); err != nil {
			t.Fatalf("Failed to decode response: %v", err)
		}

		if updatedProject.Phases[0].Content == "" {
			t.Error("Phase 1 content should be populated")
		}
		if updatedProject.Phase != 2 {
			t.Errorf("Project should advance to phase 2, got %d", updatedProject.Phase)
		}
		if updatedProject.Phases[1].Prompt == "" {
			t.Error("Phase 2 prompt should be populated")
		}
	})

	t.Run("MockAIDisabled", func(t *testing.T) {
		// Temporarily disable mock AI
		InitMockAI(false)
		defer InitMockAI(true)

		router := mux.NewRouter()
		router.HandleFunc("/api/projects/{id}/generate/{phase}", generateMockResponse).Methods("POST")

		req, _ := http.NewRequest("POST", "/api/projects/"+testProjectID+"/generate/1", nil)
		rr := httptest.NewRecorder()

		router.ServeHTTP(rr, req)

		if status := rr.Code; status != http.StatusForbidden {
			t.Errorf("Handler should return 403 when mock AI disabled: got %v", status)
		}
	})
}
