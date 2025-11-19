package main

import (
	"encoding/json"
	"net/http"
	"os"
	"runtime"
	"sync/atomic"
	"time"
)

// MetricsCollector collects application metrics
type MetricsCollector struct {
	requestCount    int64
	errorCount      int64
	projectsCreated int64
	phasesUpdated   int64
	startTime       time.Time
}

// Global metrics collector
var globalMetrics *MetricsCollector

// InitMetrics initializes the metrics collector
func InitMetrics() {
	globalMetrics = &MetricsCollector{
		startTime: time.Now(),
	}
}

// GetMetrics returns the global metrics collector
func GetMetrics() *MetricsCollector {
	if globalMetrics == nil {
		InitMetrics()
	}
	return globalMetrics
}

// IncrementRequestCount increments the request counter
func (m *MetricsCollector) IncrementRequestCount() {
	atomic.AddInt64(&m.requestCount, 1)
}

// IncrementErrorCount increments the error counter
func (m *MetricsCollector) IncrementErrorCount() {
	atomic.AddInt64(&m.errorCount, 1)
}

// IncrementProjectsCreated increments the projects created counter
func (m *MetricsCollector) IncrementProjectsCreated() {
	atomic.AddInt64(&m.projectsCreated, 1)
}

// IncrementPhasesUpdated increments the phases updated counter
func (m *MetricsCollector) IncrementPhasesUpdated() {
	atomic.AddInt64(&m.phasesUpdated, 1)
}

// ApplicationMetrics represents the current application metrics
type ApplicationMetrics struct {
	// Request metrics
	RequestCount int64   `json:"request_count"`
	ErrorCount   int64   `json:"error_count"`
	ErrorRate    float64 `json:"error_rate_percent"`

	// Business metrics
	ProjectsCreated int64 `json:"projects_created"`
	PhasesUpdated   int64 `json:"phases_updated"`

	// System metrics
	Uptime         string  `json:"uptime"`
	UptimeSeconds  int64   `json:"uptime_seconds"`
	MemoryUsageMB  float64 `json:"memory_usage_mb"`
	GoroutineCount int     `json:"goroutine_count"`

	// File system metrics
	FileSystemStats *FileSystemStats `json:"file_system_stats,omitempty"`

	// Cache metrics
	CacheStats map[string]interface{} `json:"cache_stats,omitempty"`
}

// GetApplicationMetrics returns current application metrics
func (m *MetricsCollector) GetApplicationMetrics() *ApplicationMetrics {
	requestCount := atomic.LoadInt64(&m.requestCount)
	errorCount := atomic.LoadInt64(&m.errorCount)

	var errorRate float64
	if requestCount > 0 {
		errorRate = (float64(errorCount) / float64(requestCount)) * 100
	}

	uptime := time.Since(m.startTime)

	// Get memory stats
	var memStats runtime.MemStats
	runtime.ReadMemStats(&memStats)
	memoryUsageMB := float64(memStats.Alloc) / 1024 / 1024

	metrics := &ApplicationMetrics{
		RequestCount:    requestCount,
		ErrorCount:      errorCount,
		ErrorRate:       errorRate,
		ProjectsCreated: atomic.LoadInt64(&m.projectsCreated),
		PhasesUpdated:   atomic.LoadInt64(&m.phasesUpdated),
		Uptime:          uptime.String(),
		UptimeSeconds:   int64(uptime.Seconds()),
		MemoryUsageMB:   memoryUsageMB,
		GoroutineCount:  runtime.NumGoroutine(),
	}

	// Add file system stats if available
	if fsStats, err := GetFileSystemStats(); err == nil {
		metrics.FileSystemStats = fsStats
	}

	// Add cache stats if available
	if globalFileManager != nil {
		metrics.CacheStats = globalFileManager.GetCacheStats()
	}

	return metrics
}

// metricsHandler serves application metrics
func metricsHandler(w http.ResponseWriter, r *http.Request) {
	metrics := GetMetrics()
	appMetrics := metrics.GetApplicationMetrics()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(appMetrics)
}

// healthzHandler serves detailed health information
func healthzHandler(w http.ResponseWriter, r *http.Request) {
	metrics := GetMetrics()

	health := map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"uptime":    time.Since(metrics.startTime).String(),
		"version":   "1.0.0", // Could be set via build flags
	}

	// Check file system health
	if _, err := GetFileSystemStats(); err != nil {
		health["file_system_error"] = err.Error()
	}

	// Check if directories are accessible
	outputsDir := getOutputsDir()
	if _, err := os.Stat(outputsDir); err != nil {
		health["outputs_dir_error"] = err.Error()
	}

	promptsDir := getPromptsDir()
	if _, err := os.Stat(promptsDir); err != nil {
		health["prompts_dir_error"] = err.Error()
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(health)
}

// readinessHandler serves readiness probe
func readinessHandler(w http.ResponseWriter, r *http.Request) {
	// Check if application is ready to serve requests
	ready := map[string]interface{}{
		"status": "ready",
		"checks": map[string]string{},
	}

	// Check file manager
	if globalFileManager == nil {
		ready["status"] = "not_ready"
		ready["checks"].(map[string]string)["file_manager"] = "not_initialized"
	} else {
		ready["checks"].(map[string]string)["file_manager"] = "ok"
	}

	// Check directories
	outputsDir := getOutputsDir()
	if _, err := os.Stat(outputsDir); err != nil {
		ready["status"] = "not_ready"
		ready["checks"].(map[string]string)["outputs_dir"] = err.Error()
	} else {
		ready["checks"].(map[string]string)["outputs_dir"] = "ok"
	}

	promptsDir := getPromptsDir()
	if _, err := os.Stat(promptsDir); err != nil {
		ready["status"] = "not_ready"
		ready["checks"].(map[string]string)["prompts_dir"] = err.Error()
	} else {
		ready["checks"].(map[string]string)["prompts_dir"] = "ok"
	}

	// Set status code based on readiness
	if ready["status"] == "not_ready" {
		w.WriteHeader(http.StatusServiceUnavailable)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ready)
}

// MetricsMiddleware collects request metrics
func MetricsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		metrics := GetMetrics()
		metrics.IncrementRequestCount()

		// Wrap response writer to capture status code
		mrw := &MetricsResponseWriter{ResponseWriter: w, statusCode: 200}

		next.ServeHTTP(mrw, r)

		// Increment error count for 4xx and 5xx status codes
		if mrw.statusCode >= 400 {
			metrics.IncrementErrorCount()
		}
	})
}

// MetricsResponseWriter wraps http.ResponseWriter to capture metrics
type MetricsResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (mrw *MetricsResponseWriter) WriteHeader(code int) {
	mrw.statusCode = code
	mrw.ResponseWriter.WriteHeader(code)
}
