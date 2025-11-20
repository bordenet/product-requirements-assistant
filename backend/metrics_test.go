package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
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
