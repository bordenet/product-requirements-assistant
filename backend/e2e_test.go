package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// TestData represents the structure of test data files
type TestData struct {
	Title    string `json:"title"`
	Problems string `json:"problems"`
	Context  string `json:"context"`
}

// setupTestServer creates a test server with all routes
func setupTestServer() *httptest.Server {
	// Reset projects map for clean test state
	projects = make(map[string]*Project)
	
	router := mux.NewRouter()
	router.HandleFunc("/api/health", healthCheck).Methods("GET")
	router.HandleFunc("/api/projects", createProject).Methods("POST")
	router.HandleFunc("/api/projects/{id}", getProject).Methods("GET")
	router.HandleFunc("/api/projects/{id}/phase/{phase}", updatePhase).Methods("POST")
	router.HandleFunc("/api/prompts/{phase}", getPrompt).Methods("GET")
	router.HandleFunc("/api/projects", listProjects).Methods("GET")

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders: []string{"*"},
	})

	return httptest.NewServer(c.Handler(router))
}

// loadTestData loads test data from the testdata directory
func loadTestData(filename string) (*TestData, error) {
	// Go up one level to reach the project root, then into testdata
	testDataPath := filepath.Join("..", "testdata", "projects", filename)
	data, err := os.ReadFile(testDataPath)
	if err != nil {
		return nil, err
	}

	var testData TestData
	err = json.Unmarshal(data, &testData)
	if err != nil {
		return nil, err
	}

	return &testData, nil
}

// loadTestResponse loads test response content from testdata
func loadTestResponse(filename string) (string, error) {
	testDataPath := filepath.Join("..", "testdata", "responses", filename)
	data, err := os.ReadFile(testDataPath)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func TestEndToEndWorkflow(t *testing.T) {
	server := setupTestServer()
	defer server.Close()

	// Test both project scenarios
	testCases := []struct {
		name         string
		dataFile     string
		phase1File   string
		phase2File   string
		phase3File   string
	}{
		{
			name:         "AI Chat Widget",
			dataFile:     "ai-chat-widget.json",
			phase1File:   "ai-chat-widget-phase1-claude.md",
			phase2File:   "ai-chat-widget-phase2-gemini.md",
			phase3File:   "ai-chat-widget-phase3-claude.md",
		},
		{
			name:         "Mobile Offline Sync",
			dataFile:     "mobile-offline-sync.json",
			phase1File:   "mobile-offline-sync-phase1-claude.md",
			phase2File:   "mobile-offline-sync-phase2-gemini.md",
			phase3File:   "mobile-offline-sync-phase3-claude.md",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			testEndToEndWorkflowScenario(t, server.URL, tc.dataFile, tc.phase1File, tc.phase2File, tc.phase3File)
		})
	}
}

func testEndToEndWorkflowScenario(t *testing.T, serverURL, dataFile, phase1File, phase2File, phase3File string) {
	// Step 1: Load test data
	testData, err := loadTestData(dataFile)
	if err != nil {
		t.Fatalf("Failed to load test data: %v", err)
	}

	// Step 2: Create project
	createReq := CreateProjectRequest{
		Title:    testData.Title,
		Problems: testData.Problems,
		Context:  testData.Context,
	}

	reqBody, _ := json.Marshal(createReq)
	resp, err := http.Post(serverURL+"/api/projects", "application/json", bytes.NewBuffer(reqBody))
	if err != nil {
		t.Fatalf("Failed to create project: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("Create project failed with status %d: %s", resp.StatusCode, string(body))
	}

	var project Project
	err = json.NewDecoder(resp.Body).Decode(&project)
	if err != nil {
		t.Fatalf("Failed to decode project response: %v", err)
	}

	// Validate project creation
	if project.ID == "" {
		t.Error("Project ID should not be empty")
	}
	if project.Title != testData.Title {
		t.Errorf("Expected title %s, got %s", testData.Title, project.Title)
	}
	if project.Phase != 1 {
		t.Errorf("Expected phase 1, got %d", project.Phase)
	}
	if len(project.Phases) != 3 {
		t.Errorf("Expected 3 phases, got %d", len(project.Phases))
	}

	// Validate Phase 1 prompt was generated
	if project.Phases[0].Prompt == "" {
		t.Error("Phase 1 prompt should be populated")
	}

	// Step 3: Simulate Phase 1 - Claude Initial Response
	phase1Response, err := loadTestResponse(phase1File)
	if err != nil {
		t.Fatalf("Failed to load phase 1 response: %v", err)
	}

	updateReq := UpdatePhaseRequest{Content: phase1Response}
	reqBody, _ = json.Marshal(updateReq)
	resp, err = http.Post(
		fmt.Sprintf("%s/api/projects/%s/phase/1", serverURL, project.ID),
		"application/json",
		bytes.NewBuffer(reqBody),
	)
	if err != nil {
		t.Fatalf("Failed to update phase 1: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("Update phase 1 failed with status %d: %s", resp.StatusCode, string(body))
	}

	err = json.NewDecoder(resp.Body).Decode(&project)
	if err != nil {
		t.Fatalf("Failed to decode phase 1 update response: %v", err)
	}

	// Validate Phase 1 completion
	if project.Phases[0].Content == "" {
		t.Error("Phase 1 content should be populated")
	}
	if project.Phase != 2 {
		t.Errorf("Expected phase 2 after phase 1 completion, got %d", project.Phase)
	}
	if project.Phases[1].Prompt == "" {
		t.Error("Phase 2 prompt should be auto-generated after phase 1")
	}

	// Step 4: Simulate Phase 2 - Gemini Review
	phase2Response, err := loadTestResponse(phase2File)
	if err != nil {
		t.Fatalf("Failed to load phase 2 response: %v", err)
	}

	updateReq = UpdatePhaseRequest{Content: phase2Response}
	reqBody, _ = json.Marshal(updateReq)
	resp, err = http.Post(
		fmt.Sprintf("%s/api/projects/%s/phase/2", serverURL, project.ID),
		"application/json",
		bytes.NewBuffer(reqBody),
	)
	if err != nil {
		t.Fatalf("Failed to update phase 2: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("Update phase 2 failed with status %d: %s", resp.StatusCode, string(body))
	}

	err = json.NewDecoder(resp.Body).Decode(&project)
	if err != nil {
		t.Fatalf("Failed to decode phase 2 update response: %v", err)
	}

	// Validate Phase 2 completion
	if project.Phases[1].Content == "" {
		t.Error("Phase 2 content should be populated")
	}
	if project.Phase != 3 {
		t.Errorf("Expected phase 3 after phase 2 completion, got %d", project.Phase)
	}
	if project.Phases[2].Prompt == "" {
		t.Error("Phase 3 prompt should be auto-generated after phase 2")
	}

	// Step 5: Simulate Phase 3 - Claude Final Comparison
	phase3Response, err := loadTestResponse(phase3File)
	if err != nil {
		t.Fatalf("Failed to load phase 3 response: %v", err)
	}

	updateReq = UpdatePhaseRequest{Content: phase3Response}
	reqBody, _ = json.Marshal(updateReq)
	resp, err = http.Post(
		fmt.Sprintf("%s/api/projects/%s/phase/3", serverURL, project.ID),
		"application/json",
		bytes.NewBuffer(reqBody),
	)
	if err != nil {
		t.Fatalf("Failed to update phase 3: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("Update phase 3 failed with status %d: %s", resp.StatusCode, string(body))
	}

	err = json.NewDecoder(resp.Body).Decode(&project)
	if err != nil {
		t.Fatalf("Failed to decode phase 3 update response: %v", err)
	}

	// Validate Phase 3 completion
	if project.Phases[2].Content == "" {
		t.Error("Phase 3 content should be populated")
	}

	// Validate all phases have completion timestamps
	for i, phase := range project.Phases {
		if phase.Content != "" && phase.CompletedAt.IsZero() {
			t.Errorf("Phase %d should have completion timestamp", i+1)
		}
	}

	// Step 6: Test project retrieval
	resp, err = http.Get(fmt.Sprintf("%s/api/projects/%s", serverURL, project.ID))
	if err != nil {
		t.Fatalf("Failed to retrieve project: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Get project failed with status %d", resp.StatusCode)
	}

	var retrievedProject Project
	err = json.NewDecoder(resp.Body).Decode(&retrievedProject)
	if err != nil {
		t.Fatalf("Failed to decode retrieved project: %v", err)
	}

	// Validate retrieved project matches
	if retrievedProject.ID != project.ID {
		t.Error("Retrieved project ID should match")
	}
	if retrievedProject.Title != project.Title {
		t.Error("Retrieved project title should match")
	}

	// Step 7: Test project listing
	resp, err = http.Get(serverURL + "/api/projects")
	if err != nil {
		t.Fatalf("Failed to list projects: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("List projects failed with status %d", resp.StatusCode)
	}

	var projectList []*Project
	err = json.NewDecoder(resp.Body).Decode(&projectList)
	if err != nil {
		t.Fatalf("Failed to decode project list: %v", err)
	}

	// Should contain our created project
	found := false
	for _, p := range projectList {
		if p.ID == project.ID {
			found = true
			break
		}
	}
	if !found {
		t.Error("Created project should appear in project list")
	}

	t.Logf("Successfully completed end-to-end workflow for: %s", testData.Title)
}

func TestPromptEndpoints(t *testing.T) {
	server := setupTestServer()
	defer server.Close()

	prompts := []string{"claude_initial", "gemini_review", "claude_compare"}

	for _, promptName := range prompts {
		t.Run(fmt.Sprintf("Prompt_%s", promptName), func(t *testing.T) {
			// Test getting prompt
			resp, err := http.Get(fmt.Sprintf("%s/api/prompts/%s", server.URL, promptName))
			if err != nil {
				t.Fatalf("Failed to get prompt: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				t.Fatalf("Get prompt failed with status %d", resp.StatusCode)
			}

			var promptResp map[string]string
			err = json.NewDecoder(resp.Body).Decode(&promptResp)
			if err != nil {
				t.Fatalf("Failed to decode prompt response: %v", err)
			}

			if promptResp["content"] == "" {
				t.Error("Prompt content should not be empty")
			}
		})
	}
}

func TestInputValidation(t *testing.T) {
	server := setupTestServer()
	defer server.Close()

	testCases := []struct {
		name           string
		request        CreateProjectRequest
		expectedStatus int
	}{
		{
			name: "Valid request",
			request: CreateProjectRequest{
				Title:    "Test Project",
				Problems: "Some problems to solve",
				Context:  "Some context",
			},
			expectedStatus: http.StatusOK,
		},
		{
			name: "Missing title",
			request: CreateProjectRequest{
				Title:    "",
				Problems: "Some problems to solve",
				Context:  "Some context",
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "Missing problems",
			request: CreateProjectRequest{
				Title:    "Test Project",
				Problems: "",
				Context:  "Some context",
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "Title too long",
			request: CreateProjectRequest{
				Title:    strings.Repeat("a", 201),
				Problems: "Some problems to solve",
				Context:  "Some context",
			},
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			reqBody, _ := json.Marshal(tc.request)
			resp, err := http.Post(server.URL+"/api/projects", "application/json", bytes.NewBuffer(reqBody))
			if err != nil {
				t.Fatalf("Failed to make request: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tc.expectedStatus {
				body, _ := io.ReadAll(resp.Body)
				t.Errorf("Expected status %d, got %d: %s", tc.expectedStatus, resp.StatusCode, string(body))
			}
		})
	}
}

func TestHealthCheck(t *testing.T) {
	server := setupTestServer()
	defer server.Close()

	resp, err := http.Get(server.URL + "/api/health")
	if err != nil {
		t.Fatalf("Failed to call health check: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	var healthResp map[string]string
	err = json.NewDecoder(resp.Body).Decode(&healthResp)
	if err != nil {
		t.Fatalf("Failed to decode health response: %v", err)
	}

	if healthResp["status"] != "healthy" {
		t.Errorf("Expected status 'healthy', got '%s'", healthResp["status"])
	}
}

// Benchmark the complete workflow
func BenchmarkEndToEndWorkflow(b *testing.B) {
	server := setupTestServer()
	defer server.Close()

	testData, err := loadTestData("ai-chat-widget.json")
	if err != nil {
		b.Fatalf("Failed to load test data: %v", err)
	}

	phase1Response, err := loadTestResponse("ai-chat-widget-phase1-claude.md")
	if err != nil {
		b.Fatalf("Failed to load phase 1 response: %v", err)
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		// Create project
		createReq := CreateProjectRequest{
			Title:    fmt.Sprintf("%s-%d", testData.Title, i),
			Problems: testData.Problems,
			Context:  testData.Context,
		}

		reqBody, _ := json.Marshal(createReq)
		resp, err := http.Post(server.URL+"/api/projects", "application/json", bytes.NewBuffer(reqBody))
		if err != nil {
			b.Fatalf("Failed to create project: %v", err)
		}

		var project Project
		json.NewDecoder(resp.Body).Decode(&project)
		resp.Body.Close()

		// Update phase 1
		updateReq := UpdatePhaseRequest{Content: phase1Response}
		reqBody, _ = json.Marshal(updateReq)
		resp, err = http.Post(
			fmt.Sprintf("%s/api/projects/%s/phase/1", server.URL, project.ID),
			"application/json",
			bytes.NewBuffer(reqBody),
		)
		if err != nil {
			b.Fatalf("Failed to update phase 1: %v", err)
		}
		resp.Body.Close()
	}
}