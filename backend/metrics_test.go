package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"

	"os"
	"path/filepath"
	"testing"
)

func TestInitMetrics(t *testing.T) {
	InitMetrics()

	metrics := GetMetrics()
	if metrics == nil {
		t.Error("Expected metrics to be initialized, got nil")
	}

	appMetrics := metrics.GetApplicationMetrics()
	if appMetrics.RequestCount != 0 {
		t.Errorf("Expected RequestCount to be 0, got %d", appMetrics.RequestCount)
	}
	if appMetrics.ErrorCount != 0 {
		t.Errorf("Expected ErrorCount to be 0, got %d", appMetrics.ErrorCount)
	}
	if appMetrics.ProjectsCreated != 0 {
		t.Errorf("Expected ProjectsCreated to be 0, got %d", appMetrics.ProjectsCreated)
	}
	if appMetrics.PhasesUpdated != 0 {
		t.Errorf("Expected PhasesUpdated to be 0, got %d", appMetrics.PhasesUpdated)
	}
}

func TestIncrementMetrics(t *testing.T) {
	InitMetrics()
	metrics := GetMetrics()

	metrics.IncrementRequestCount()
	appMetrics := metrics.GetApplicationMetrics()
	if appMetrics.RequestCount != 1 {
		t.Errorf("Expected RequestCount to be 1, got %d", appMetrics.RequestCount)
	}

	metrics.IncrementErrorCount()
	appMetrics = metrics.GetApplicationMetrics()
	if appMetrics.ErrorCount != 1 {
		t.Errorf("Expected ErrorCount to be 1, got %d", appMetrics.ErrorCount)
	}

	metrics.IncrementProjectsCreated()
	appMetrics = metrics.GetApplicationMetrics()
	if appMetrics.ProjectsCreated != 1 {
		t.Errorf("Expected ProjectsCreated to be 1, got %d", appMetrics.ProjectsCreated)
	}

	metrics.IncrementPhasesUpdated()
	appMetrics = metrics.GetApplicationMetrics()
	if appMetrics.PhasesUpdated != 1 {
		t.Errorf("Expected PhasesUpdated to be 1, got %d", appMetrics.PhasesUpdated)
	}
}

func TestMetricsHandler(t *testing.T) {
	InitMetrics()
	metrics := GetMetrics()
	metrics.IncrementRequestCount()
	metrics.IncrementProjectsCreated()

	req, _ := http.NewRequest("GET", "/metrics", nil)
	rr := httptest.NewRecorder()

	handler := http.HandlerFunc(metricsHandler)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	var appMetrics ApplicationMetrics
	if err := json.NewDecoder(rr.Body).Decode(&appMetrics); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if appMetrics.RequestCount != 1 {
		t.Errorf("Expected RequestCount to be 1, got %d", appMetrics.RequestCount)
	}
	if appMetrics.ProjectsCreated != 1 {
		t.Errorf("Expected ProjectsCreated to be 1, got %d", appMetrics.ProjectsCreated)
	}
}

func TestHealthzHandler(t *testing.T) {
	req, _ := http.NewRequest("GET", "/healthz", nil)
	rr := httptest.NewRecorder()

	handler := http.HandlerFunc(healthzHandler)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	var response map[string]string
	if err := json.NewDecoder(rr.Body).Decode(&response); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if response["status"] != "healthy" {
		t.Errorf("Expected status 'healthy', got '%s'", response["status"])
	}
}

func TestReadinessHandler(t *testing.T) {
	req, _ := http.NewRequest("GET", "/readiness", nil)
	rr := httptest.NewRecorder()

	handler := http.HandlerFunc(readinessHandler)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	var response map[string]interface{}
	if err := json.NewDecoder(rr.Body).Decode(&response); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if response["status"] != "ready" {
		t.Errorf("Expected status 'ready', got '%v'", response["status"])
	}
}

func TestMetricsMiddleware(t *testing.T) {
	InitMetrics()

	handler := MetricsMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req, _ := http.NewRequest("GET", "/test", nil)
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	metrics := GetMetrics()
	appMetrics := metrics.GetApplicationMetrics()
	if appMetrics.RequestCount != 1 {
		t.Errorf("Expected RequestCount to be incremented to 1, got %d", appMetrics.RequestCount)
	}
}

func TestReadinessHandlerWithChecks(t *testing.T) {
	// Initialize metrics to ensure readiness checks pass
	InitMetrics()

	req, _ := http.NewRequest("GET", "/readiness", nil)
	rr := httptest.NewRecorder()

	handler := http.HandlerFunc(readinessHandler)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	var response map[string]interface{}
	if err := json.NewDecoder(rr.Body).Decode(&response); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	// Check that checks field exists
	if _, ok := response["checks"]; !ok {
		t.Error("Expected 'checks' field in response")
	}
}

func TestMetricsMiddlewareWithError(t *testing.T) {
	InitMetrics()

	handler := MetricsMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))

	req, _ := http.NewRequest("GET", "/test", nil)
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusInternalServerError {
		t.Errorf("Handler returned wrong status code: got %v want %v",
			status, http.StatusInternalServerError)
	}

	metrics := GetMetrics()
	appMetrics := metrics.GetApplicationMetrics()
	if appMetrics.ErrorCount != 1 {
		t.Errorf("Expected ErrorCount to be incremented to 1, got %d", appMetrics.ErrorCount)
	}
}

func TestHealthzHandlerWithMissingDirectories(t *testing.T) {
	tempRoot := t.TempDir()
	cleanup := withTestProjectRoot(t, tempRoot)
	defer cleanup()

	req, _ := http.NewRequest("GET", "/healthz", nil)
	rr := httptest.NewRecorder()

	handler := http.HandlerFunc(healthzHandler)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Fatalf("unexpected status code: got %v want %v", status, http.StatusOK)
	}

	var response map[string]interface{}
	if err := json.NewDecoder(rr.Body).Decode(&response); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if response["status"] != "healthy" {
		t.Errorf("expected status 'healthy', got %v", response["status"])
	}

	if _, ok := response["outputs_dir_error"]; !ok {
		t.Errorf("expected outputs_dir_error when outputs dir is missing")
	}
	if _, ok := response["prompts_dir_error"]; !ok {
		t.Errorf("expected prompts_dir_error when prompts dir is missing")
	}
	if _, ok := response["file_system_error"]; !ok {
		t.Errorf("expected file_system_error when outputs dir is missing")
	}
}

func TestHealthzHandlerWithHealthyFileSystem(t *testing.T) {
	tempRoot := t.TempDir()
	cleanup := withTestProjectRoot(t, tempRoot)
	defer cleanup()

	outputsDir := filepath.Join(tempRoot, "outputs")
	promptsDir := filepath.Join(tempRoot, "prompts")

	if err := os.MkdirAll(outputsDir, 0o755); err != nil {
		t.Fatalf("failed to create outputs dir: %v", err)
	}
	if err := os.MkdirAll(promptsDir, 0o755); err != nil {
		t.Fatalf("failed to create prompts dir: %v", err)
	}

	if err := os.WriteFile(filepath.Join(outputsDir, "project.json"), []byte("{}"), 0o644); err != nil {
		t.Fatalf("failed to write test file: %v", err)
	}

	req, _ := http.NewRequest("GET", "/healthz", nil)
	rr := httptest.NewRecorder()

	handler := http.HandlerFunc(healthzHandler)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Fatalf("unexpected status code: got %v want %v", status, http.StatusOK)
	}

	var response map[string]interface{}
	if err := json.NewDecoder(rr.Body).Decode(&response); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if response["status"] != "healthy" {
		t.Errorf("expected status 'healthy', got %v", response["status"])
	}

	if _, ok := response["outputs_dir_error"]; ok {
		t.Errorf("did not expect outputs_dir_error when outputs dir exists")
	}
	if _, ok := response["prompts_dir_error"]; ok {
		t.Errorf("did not expect prompts_dir_error when prompts dir exists")
	}
	if _, ok := response["file_system_error"]; ok {
		t.Errorf("did not expect file_system_error when filesystem stats succeed")
	}
}

func TestReadinessHandlerReadyState(t *testing.T) {
	tempRoot := t.TempDir()
	cleanup := withTestProjectRoot(t, tempRoot)
	defer cleanup()

	outputsDir := filepath.Join(tempRoot, "outputs")
	promptsDir := filepath.Join(tempRoot, "prompts")

	if err := os.MkdirAll(outputsDir, 0o755); err != nil {
		t.Fatalf("failed to create outputs dir: %v", err)
	}
	if err := os.MkdirAll(promptsDir, 0o755); err != nil {
		t.Fatalf("failed to create prompts dir: %v", err)
	}

	originalFM := globalFileManager
	InitFileManager()
	defer func() { globalFileManager = originalFM }()

	req, _ := http.NewRequest("GET", "/readiness", nil)
	rr := httptest.NewRecorder()

	handler := http.HandlerFunc(readinessHandler)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Fatalf("unexpected status code: got %v want %v", status, http.StatusOK)
	}

	var response map[string]interface{}
	if err := json.NewDecoder(rr.Body).Decode(&response); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if response["status"] != "ready" {
		t.Errorf("expected status 'ready', got %v", response["status"])
	}

	checks, ok := response["checks"].(map[string]interface{})
	if !ok {
		t.Fatalf("expected checks to be a map, got %T", response["checks"])
	}

	if checks["file_manager"] != "ok" {
		t.Errorf("expected file_manager check 'ok', got %v", checks["file_manager"])
	}
	if checks["outputs_dir"] != "ok" {
		t.Errorf("expected outputs_dir check 'ok', got %v", checks["outputs_dir"])
	}
	if checks["prompts_dir"] != "ok" {
		t.Errorf("expected prompts_dir check 'ok', got %v", checks["prompts_dir"])
	}
}

func TestReadinessHandlerNotReadyState(t *testing.T) {
	tempRoot := t.TempDir()
	cleanup := withTestProjectRoot(t, tempRoot)
	defer cleanup()

	originalFM := globalFileManager
	globalFileManager = nil
	defer func() { globalFileManager = originalFM }()

	req, _ := http.NewRequest("GET", "/readiness", nil)
	rr := httptest.NewRecorder()

	handler := http.HandlerFunc(readinessHandler)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusServiceUnavailable {
		t.Fatalf("unexpected status code: got %v want %v", status, http.StatusServiceUnavailable)
	}

	var response map[string]interface{}
	if err := json.NewDecoder(rr.Body).Decode(&response); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if response["status"] != "not_ready" {
		t.Errorf("expected status 'not_ready', got %v", response["status"])
	}

	checks, ok := response["checks"].(map[string]interface{})
	if !ok {
		t.Fatalf("expected checks to be a map, got %T", response["checks"])
	}

	if checks["file_manager"] != "not_initialized" {
		t.Errorf("expected file_manager check 'not_initialized', got %v", checks["file_manager"])
	}
	if checks["outputs_dir"] == "ok" {
		t.Errorf("expected outputs_dir check to indicate an error")
	}
	if checks["prompts_dir"] == "ok" {
		t.Errorf("expected prompts_dir check to indicate an error")
	}
}
