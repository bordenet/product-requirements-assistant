package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/gorilla/mux"
)

func TestCreateProject(t *testing.T) {
	// Reset projects map
	projects = make(map[string]*Project)
	defer func() { projects = make(map[string]*Project) }()

	tests := []struct {
		name           string
		payload        CreateProjectRequest
		expectedStatus int
		checkResponse  func(*testing.T, *httptest.ResponseRecorder)
	}{
		{
			name: "Valid project creation",
			payload: CreateProjectRequest{
				Title:    "Test Product",
				Problems: "Users need a solution",
				Context:  "Enterprise environment",
			},
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, rr *httptest.ResponseRecorder) {
				var project Project
				if err := json.NewDecoder(rr.Body).Decode(&project); err != nil {
					t.Fatalf("Failed to decode response: %v", err)
				}
				if project.ID == "" {
					t.Error("Project ID should not be empty")
				}
				if project.Title != "Test Product" {
					t.Errorf("Expected title 'Test Product', got '%s'", project.Title)
				}
				if len(project.Phases) != 3 {
					t.Errorf("Expected 3 phases, got %d", len(project.Phases))
				}
			},
		},
		{
			name: "Empty title",
			payload: CreateProjectRequest{
				Title:    "",
				Problems: "Users need a solution",
				Context:  "Enterprise environment",
			},
			expectedStatus: http.StatusBadRequest,
			checkResponse:  nil,
		},
		{
			name: "Empty problems",
			payload: CreateProjectRequest{
				Title:    "Test Product",
				Problems: "",
				Context:  "Enterprise environment",
			},
			expectedStatus: http.StatusBadRequest,
			checkResponse:  nil,
		},
		{
			name: "Title too long",
			payload: CreateProjectRequest{
				Title:    strings.Repeat("a", 300),
				Problems: "Users need a solution",
				Context:  "Enterprise environment",
			},
			expectedStatus: http.StatusBadRequest,
			checkResponse:  nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.payload)
			req, _ := http.NewRequest("POST", "/api/projects", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			rr := httptest.NewRecorder()

			handler := http.HandlerFunc(createProject)
			handler.ServeHTTP(rr, req)

			if status := rr.Code; status != tt.expectedStatus {
				t.Errorf("Handler returned wrong status code: got %v want %v. Body: %s",
					status, tt.expectedStatus, rr.Body.String())
			}

			if tt.checkResponse != nil {
				tt.checkResponse(t, rr)
			}
		})
	}
}

func TestGetProject(t *testing.T) {
	// Reset and setup test project
	projects = make(map[string]*Project)
	defer func() { projects = make(map[string]*Project) }()
	testID := "550e8400-e29b-41d4-a716-446655440000"
	projects[testID] = &Project{
		ID:          testID,
		Title:       "Test Project",
		Description: "Test Description",
		Phase:       1,
		Phases: []Phase{
			{Number: 1, Name: "Phase 1"},
			{Number: 2, Name: "Phase 2"},
			{Number: 3, Name: "Phase 3"},
		},
	}

	tests := []struct {
		name           string
		projectID      string
		expectedStatus int
	}{
		{
			name:           "Valid project ID",
			projectID:      testID,
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Invalid UUID format",
			projectID:      "invalid-uuid",
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "Non-existent project",
			projectID:      "99999999-9999-9999-9999-999999999998",
			expectedStatus: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			router := mux.NewRouter()
			router.HandleFunc("/api/projects/{id}", getProject).Methods("GET")

			req, _ := http.NewRequest("GET", "/api/projects/"+tt.projectID, nil)
			rr := httptest.NewRecorder()

			router.ServeHTTP(rr, req)

			if status := rr.Code; status != tt.expectedStatus {
				t.Errorf("Handler returned wrong status code: got %v want %v",
					status, tt.expectedStatus)
			}
		})
	}
}

func TestUpdatePhase(t *testing.T) {
	// Reset and setup test project
	projects = make(map[string]*Project)
	defer func() { projects = make(map[string]*Project) }()
	testID := "550e8400-e29b-41d4-a716-446655440000"
	projects[testID] = &Project{
		ID:          testID,
		Title:       "Test Project",
		Description: "Test Description",
		Phase:       1,
		Phases: []Phase{
			{Number: 1, Name: "Phase 1", Prompt: "Test prompt"},
			{Number: 2, Name: "Phase 2"},
			{Number: 3, Name: "Phase 3"},
		},
	}

	tests := []struct {
		name           string
		projectID      string
		phase          string
		payload        UpdatePhaseRequest
		expectedStatus int
	}{
		{
			name:      "Valid phase 1 update",
			projectID: testID,
			phase:     "1",
			payload: UpdatePhaseRequest{
				Content: "# Test PRD\n\nThis is a test PRD content.",
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:      "Empty content",
			projectID: testID,
			phase:     "1",
			payload: UpdatePhaseRequest{
				Content: "",
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:      "Invalid phase number",
			projectID: testID,
			phase:     "5",
			payload: UpdatePhaseRequest{
				Content: "Test content",
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:      "Content too large",
			projectID: testID,
			phase:     "1",
			payload: UpdatePhaseRequest{
				Content: string(make([]byte, 300000)),
			},
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			router := mux.NewRouter()
			router.HandleFunc("/api/projects/{id}/phase/{phase}", updatePhase).Methods("POST")

			body, _ := json.Marshal(tt.payload)
			req, _ := http.NewRequest("POST", "/api/projects/"+tt.projectID+"/phase/"+tt.phase, bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			rr := httptest.NewRecorder()

			router.ServeHTTP(rr, req)

			if status := rr.Code; status != tt.expectedStatus {
				t.Errorf("Handler returned wrong status code: got %v want %v. Body: %s",
					status, tt.expectedStatus, rr.Body.String())
			}
		})
	}
}

func TestListProjects(t *testing.T) {
	// Reset and setup test projects
	projects = make(map[string]*Project)
	defer func() { projects = make(map[string]*Project) }()

	projects["id1"] = &Project{
		ID:    "id1",
		Title: "Project 1",
		Phase: 1,
	}
	projects["id2"] = &Project{
		ID:    "id2",
		Title: "Project 2",
		Phase: 2,
	}

	req, _ := http.NewRequest("GET", "/api/projects", nil)
	rr := httptest.NewRecorder()

	handler := http.HandlerFunc(listProjects)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	var projectList []Project
	if err := json.NewDecoder(rr.Body).Decode(&projectList); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	// Just verify we got some projects back
	if len(projectList) < 2 {
		t.Errorf("Expected at least 2 projects, got %d", len(projectList))
	}
}

func TestUpdatePrompt(t *testing.T) {
	tests := []struct {
		name           string
		phase          string
		payload        PromptUpdate
		expectedStatus int
	}{
		{
			name:  "Valid prompt update",
			phase: "claude_initial",
			payload: PromptUpdate{
				Content: "Updated prompt template",
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:  "Empty content",
			phase: "claude_initial",
			payload: PromptUpdate{
				Content: "",
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:  "Invalid phase",
			phase: "invalid_phase",
			payload: PromptUpdate{
				Content: "Test content",
			},
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.payload)
			req := httptest.NewRequest("PUT", "/api/prompts/"+tt.phase, bytes.NewReader(body))
			rr := httptest.NewRecorder()

			router := mux.NewRouter()
			router.HandleFunc("/api/prompts/{phase}", updatePrompt).Methods("PUT")
			router.ServeHTTP(rr, req)

			if rr.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d. Body: %s", tt.expectedStatus, rr.Code, rr.Body.String())
			}
		})
	}
}

func TestGetPrompt(t *testing.T) {
	tests := []struct {
		name           string
		phase          string
		expectedStatus int
	}{
		{
			name:           "Valid phase - claude_initial",
			phase:          "claude_initial",
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Valid phase - gemini_review",
			phase:          "gemini_review",
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Valid phase - claude_compare",
			phase:          "claude_compare",
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Invalid phase",
			phase:          "invalid_phase",
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/api/prompts/"+tt.phase, nil)
			rr := httptest.NewRecorder()

			router := mux.NewRouter()
			router.HandleFunc("/api/prompts/{phase}", getPrompt).Methods("GET")
			router.ServeHTTP(rr, req)

			if rr.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, rr.Code)
			}

			if rr.Code == http.StatusOK {
				var response map[string]string
				if err := json.NewDecoder(rr.Body).Decode(&response); err != nil {
					t.Fatalf("Failed to decode response: %v", err)
				}

				if _, ok := response["content"]; !ok {
					t.Error("Expected 'content' field in response")
				}
			}
		})
	}
}

func TestGenerateMockResponseWithMockDisabled(t *testing.T) {
	// Temporarily disable mock AI by setting env var
	originalEnv := os.Getenv("MOCK_AI_ENABLED")
	os.Setenv("MOCK_AI_ENABLED", "false")
	InitMockAI(false)
	defer func() {
		os.Setenv("MOCK_AI_ENABLED", originalEnv)
		InitMockAI(originalEnv == "true")
	}()

	req := httptest.NewRequest("POST", "/api/projects/test-id/mock/1", nil)
	rr := httptest.NewRecorder()

	router := mux.NewRouter()
	router.HandleFunc("/api/projects/{id}/mock/{phase}", generateMockResponse).Methods("POST")
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusForbidden {
		t.Errorf("Expected status 403, got %d", rr.Code)
	}
}

func TestGenerateMockResponseWithInvalidProjectID(t *testing.T) {
	// Ensure mock AI is enabled
	InitMockAI(true)

	req := httptest.NewRequest("POST", "/api/projects/invalid-id!/mock/1", nil)
	rr := httptest.NewRecorder()

	router := mux.NewRouter()
	router.HandleFunc("/api/projects/{id}/mock/{phase}", generateMockResponse).Methods("POST")
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", rr.Code)
	}
}

func TestGenerateMockResponseWithInvalidPhase(t *testing.T) {
	// Ensure mock AI is enabled
	InitMockAI(true)

	req := httptest.NewRequest("POST", "/api/projects/test-id/mock/5", nil)
	rr := httptest.NewRecorder()

	router := mux.NewRouter()
	router.HandleFunc("/api/projects/{id}/mock/{phase}", generateMockResponse).Methods("POST")
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", rr.Code)
	}
}

func TestCreateProjectWithInvalidJSON(t *testing.T) {
	req := httptest.NewRequest("POST", "/api/projects", strings.NewReader("invalid json"))
	rr := httptest.NewRecorder()

	createProject(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", rr.Code)
	}
}

func TestUpdatePhaseWithInvalidJSON(t *testing.T) {
	projects = make(map[string]*Project)
	defer func() { projects = make(map[string]*Project) }()

	// Create a project first
	project := &Project{
		ID:    "test-id",
		Title: "Test",
		Phase: 1,
		Phases: []Phase{
			{Prompt: "test"},
			{Prompt: ""},
			{Prompt: ""},
		},
	}
	projects[project.ID] = project

	req := httptest.NewRequest("POST", "/api/projects/test-id/phase/1", strings.NewReader("invalid json"))
	rr := httptest.NewRecorder()

	router := mux.NewRouter()
	router.HandleFunc("/api/projects/{id}/phase/{phase}", updatePhase).Methods("POST")
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", rr.Code)
	}
}

func TestUpdatePhaseWithNonExistentProject(t *testing.T) {
	projects = make(map[string]*Project)
	defer func() { projects = make(map[string]*Project) }()

	payload := UpdatePhaseRequest{Content: "test content"}
	body, _ := json.Marshal(payload)

	// Use a valid UUID format that definitely doesn't exist
	nonExistentID := "99999999-9999-9999-9999-999999999999"
	req := httptest.NewRequest("POST", "/api/projects/"+nonExistentID+"/phase/1", bytes.NewReader(body))
	rr := httptest.NewRecorder()

	router := mux.NewRouter()
	router.HandleFunc("/api/projects/{id}/phase/{phase}", updatePhase).Methods("POST")
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Errorf("Expected status 404, got %d. Body: %s", rr.Code, rr.Body.String())
	}
}

func TestUpdatePromptWithInvalidJSON(t *testing.T) {
	req := httptest.NewRequest("PUT", "/api/prompts/claude_initial", strings.NewReader("invalid json"))
	rr := httptest.NewRecorder()

	router := mux.NewRouter()
	router.HandleFunc("/api/prompts/{phase}", updatePrompt).Methods("PUT")
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", rr.Code)
	}
}

func TestGenerateMockResponseSuccess(t *testing.T) {
	projects = make(map[string]*Project)
	defer func() { projects = make(map[string]*Project) }()

	// Ensure mock AI is enabled
	InitMockAI(true)

	// Create a project with valid UUID
	projectID := "550e8400-e29b-41d4-a716-446655440000"
	project := &Project{
		ID:          projectID,
		Title:       "Test Project",
		Description: "Test Description",
		Phase:       1,
		Phases: []Phase{
			{Prompt: "test prompt"},
			{Prompt: ""},
			{Prompt: ""},
		},
	}
	projects[project.ID] = project

	req := httptest.NewRequest("POST", "/api/projects/"+projectID+"/mock/1", nil)
	rr := httptest.NewRecorder()

	router := mux.NewRouter()
	router.HandleFunc("/api/projects/{id}/mock/{phase}", generateMockResponse).Methods("POST")
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", rr.Code, rr.Body.String())
	}

	var updatedProject Project
	if err := json.NewDecoder(rr.Body).Decode(&updatedProject); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	// Verify the phase content was populated
	if updatedProject.Phases[0].Content == "" {
		t.Error("Expected phase 1 content to be populated")
	}
}

func TestEnsurePromptsPopulated(t *testing.T) {
	project := &Project{
		Title:       "Test Project",
		Description: "Test Description",
		Phases: []Phase{
			{Prompt: "", Content: ""},
			{Prompt: "", Content: ""},
			{Prompt: "", Content: ""},
		},
	}

	ensurePromptsPopulated(project)

	// Phase 1 should always be populated
	if project.Phases[0].Prompt == "" {
		t.Error("Phase 1 prompt should be populated")
	}
}

func TestEnsurePromptsPopulatedWithPhase1Complete(t *testing.T) {
	project := &Project{
		Title:       "Test Project",
		Description: "Test Description",
		Phases: []Phase{
			{Prompt: "phase 1 prompt", Content: "phase 1 content"},
			{Prompt: "", Content: ""},
			{Prompt: "", Content: ""},
		},
	}

	ensurePromptsPopulated(project)

	// Phase 2 should be populated when Phase 1 is complete
	if project.Phases[1].Prompt == "" {
		t.Error("Phase 2 prompt should be populated when Phase 1 is complete")
	}
}

func TestEnsurePromptsPopulatedWithAllPhasesComplete(t *testing.T) {
	project := &Project{
		Title:       "Test Project",
		Description: "Test Description",
		Phases: []Phase{
			{Prompt: "phase 1 prompt", Content: "phase 1 content"},
			{Prompt: "phase 2 prompt", Content: "phase 2 content"},
			{Prompt: "", Content: ""},
		},
	}

	ensurePromptsPopulated(project)

	// Phase 3 should be populated when Phases 1 and 2 are complete
	if project.Phases[2].Prompt == "" {
		t.Error("Phase 3 prompt should be populated when Phases 1 and 2 are complete")
	}
}

func TestGenerateMockResponsePhase2(t *testing.T) {
	projects = make(map[string]*Project)
	defer func() { projects = make(map[string]*Project) }()

	// Ensure mock AI is enabled
	InitMockAI(true)

	// Create a project with Phase 1 complete
	projectID := "550e8400-e29b-41d4-a716-446655440001"
	project := &Project{
		ID:          projectID,
		Title:       "Test Project",
		Description: "Test Description",
		Phase:       2,
		Phases: []Phase{
			{Prompt: "test prompt", Content: "phase 1 content"},
			{Prompt: "test prompt 2"},
			{Prompt: ""},
		},
	}
	projects[project.ID] = project

	req := httptest.NewRequest("POST", "/api/projects/"+projectID+"/mock/2", nil)
	rr := httptest.NewRecorder()

	router := mux.NewRouter()
	router.HandleFunc("/api/projects/{id}/mock/{phase}", generateMockResponse).Methods("POST")
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", rr.Code, rr.Body.String())
	}

	var updatedProject Project
	if err := json.NewDecoder(rr.Body).Decode(&updatedProject); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	// Verify the phase 2 content was populated
	if updatedProject.Phases[1].Content == "" {
		t.Error("Expected phase 2 content to be populated")
	}
}

func TestGenerateMockResponsePhase3(t *testing.T) {
	projects = make(map[string]*Project)
	defer func() { projects = make(map[string]*Project) }()

	// Ensure mock AI is enabled
	InitMockAI(true)

	// Create a project with Phases 1 and 2 complete
	projectID := "550e8400-e29b-41d4-a716-446655440002"
	project := &Project{
		ID:          projectID,
		Title:       "Test Project",
		Description: "Test Description",
		Phase:       3,
		Phases: []Phase{
			{Prompt: "test prompt", Content: "phase 1 content"},
			{Prompt: "test prompt 2", Content: "phase 2 content"},
			{Prompt: "test prompt 3"},
		},
	}
	projects[project.ID] = project

	req := httptest.NewRequest("POST", "/api/projects/"+projectID+"/mock/3", nil)
	rr := httptest.NewRecorder()

	router := mux.NewRouter()
	router.HandleFunc("/api/projects/{id}/mock/{phase}", generateMockResponse).Methods("POST")
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", rr.Code, rr.Body.String())
	}

	var updatedProject Project
	if err := json.NewDecoder(rr.Body).Decode(&updatedProject); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	// Verify the phase 3 content was populated
	if updatedProject.Phases[2].Content == "" {
		t.Error("Expected phase 3 content to be populated")
	}
}

func TestGenerateMockResponsePhase2WithoutPhase1(t *testing.T) {
	projects = make(map[string]*Project)
	defer func() { projects = make(map[string]*Project) }()

	// Ensure mock AI is enabled
	InitMockAI(true)

	// Create a project without Phase 1 complete
	projectID := "550e8400-e29b-41d4-a716-446655440003"
	project := &Project{
		ID:          projectID,
		Title:       "Test Project",
		Description: "Test Description",
		Phase:       1,
		Phases: []Phase{
			{Prompt: "test prompt", Content: ""},
			{Prompt: ""},
			{Prompt: ""},
		},
	}
	projects[project.ID] = project

	req := httptest.NewRequest("POST", "/api/projects/"+projectID+"/mock/2", nil)
	rr := httptest.NewRecorder()

	router := mux.NewRouter()
	router.HandleFunc("/api/projects/{id}/mock/{phase}", generateMockResponse).Methods("POST")
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", rr.Code)
	}
}
