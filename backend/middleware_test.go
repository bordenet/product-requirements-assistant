package main

import (
	"bytes"
	"compress/gzip"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestRequestSizeLimit(t *testing.T) {
	maxSize := int64(100)
	middleware := RequestSizeLimit(maxSize)

	handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write(body)
	}))

	tests := []struct {
		name           string
		bodySize       int
		expectedStatus int
	}{
		{
			name:           "Body within limit",
			bodySize:       50,
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Body at limit",
			bodySize:       100,
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Body exceeds limit",
			bodySize:       150,
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body := bytes.NewReader(bytes.Repeat([]byte("a"), tt.bodySize))
			req := httptest.NewRequest("POST", "/test", body)
			rr := httptest.NewRecorder()

			handler.ServeHTTP(rr, req)

			if rr.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, rr.Code)
			}
		})
	}
}

func TestRateLimiter(t *testing.T) {
	limiter := NewRateLimiter(2, time.Second)
	middleware := limiter.Middleware()

	handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// Test first request - should succeed
	req1 := httptest.NewRequest("GET", "/test", nil)
	req1.RemoteAddr = "192.168.1.1:12345"
	rr1 := httptest.NewRecorder()
	handler.ServeHTTP(rr1, req1)

	if rr1.Code != http.StatusOK {
		t.Errorf("First request should succeed, got %d", rr1.Code)
	}

	// Test second request - should succeed
	req2 := httptest.NewRequest("GET", "/test", nil)
	req2.RemoteAddr = "192.168.1.1:12345"
	rr2 := httptest.NewRecorder()
	handler.ServeHTTP(rr2, req2)

	if rr2.Code != http.StatusOK {
		t.Errorf("Second request should succeed, got %d", rr2.Code)
	}

	// Test third request - should fail (rate limit exceeded)
	req3 := httptest.NewRequest("GET", "/test", nil)
	req3.RemoteAddr = "192.168.1.1:12345"
	rr3 := httptest.NewRecorder()
	handler.ServeHTTP(rr3, req3)

	if rr3.Code != http.StatusTooManyRequests {
		t.Errorf("Third request should fail with 429, got %d", rr3.Code)
	}

	// Test different IP - should succeed
	req4 := httptest.NewRequest("GET", "/test", nil)
	req4.RemoteAddr = "192.168.1.2:12345"
	rr4 := httptest.NewRecorder()
	handler.ServeHTTP(rr4, req4)

	if rr4.Code != http.StatusOK {
		t.Errorf("Request from different IP should succeed, got %d", rr4.Code)
	}
}

func TestRateLimiterWithForwardedHeaders(t *testing.T) {
	limiter := NewRateLimiter(1, time.Second)
	middleware := limiter.Middleware()

	handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// Test X-Forwarded-For header
	req1 := httptest.NewRequest("GET", "/test", nil)
	req1.RemoteAddr = "192.168.1.1:12345"
	req1.Header.Set("X-Forwarded-For", "10.0.0.1")
	rr1 := httptest.NewRecorder()
	handler.ServeHTTP(rr1, req1)

	if rr1.Code != http.StatusOK {
		t.Errorf("First request should succeed, got %d", rr1.Code)
	}

	// Second request with same X-Forwarded-For should fail
	req2 := httptest.NewRequest("GET", "/test", nil)
	req2.RemoteAddr = "192.168.1.2:12345"
	req2.Header.Set("X-Forwarded-For", "10.0.0.1")
	rr2 := httptest.NewRecorder()
	handler.ServeHTTP(rr2, req2)

	if rr2.Code != http.StatusTooManyRequests {
		t.Errorf("Second request should fail, got %d", rr2.Code)
	}
}

func TestRateLimiterCleanup(t *testing.T) {
	limiter := NewRateLimiter(1, 100*time.Millisecond)

	// Add a client
	limiter.Allow("192.168.1.1")

	// Wait for cleanup window to pass
	time.Sleep(150 * time.Millisecond)

	// Manually trigger cleanup
	limiter.cleanup()

	// Verify client was removed
	limiter.mu.RLock()
	_, exists := limiter.clients["192.168.1.1"]
	limiter.mu.RUnlock()

	if exists {
		t.Error("Expected client to be cleaned up")
	}
}

func TestLoggingMiddleware(t *testing.T) {
	handler := LoggingMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("test response"))
	}))

	req := httptest.NewRequest("GET", "/test", nil)
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rr.Code)
	}

	if rr.Body.String() != "test response" {
		t.Errorf("Expected 'test response', got '%s'", rr.Body.String())
	}
}

func TestLoggingMiddlewareWithError(t *testing.T) {
	handler := LoggingMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("error"))
	}))

	req := httptest.NewRequest("POST", "/api/test", nil)
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", rr.Code)
	}
}

func TestCompressionMiddleware(t *testing.T) {
	handler := CompressionMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("test response data"))
	}))

	req := httptest.NewRequest("GET", "/test", nil)
	req.Header.Set("Accept-Encoding", "gzip")
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Header().Get("Content-Encoding") != "gzip" {
		t.Error("Expected Content-Encoding: gzip header")
	}

	// Decompress and verify content
	reader, err := gzip.NewReader(rr.Body)
	if err != nil {
		t.Fatalf("Failed to create gzip reader: %v", err)
	}
	defer reader.Close()

	decompressed, err := io.ReadAll(reader)
	if err != nil {
		t.Fatalf("Failed to read decompressed data: %v", err)
	}

	if string(decompressed) != "test response data" {
		t.Errorf("Expected 'test response data', got '%s'", string(decompressed))
	}
}

func TestCompressionMiddlewareWithoutGzipSupport(t *testing.T) {
	handler := CompressionMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("test response"))
	}))

	req := httptest.NewRequest("GET", "/test", nil)
	// No Accept-Encoding header
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Header().Get("Content-Encoding") == "gzip" {
		t.Error("Should not compress when client doesn't support gzip")
	}

	if rr.Body.String() != "test response" {
		t.Errorf("Expected 'test response', got '%s'", rr.Body.String())
	}
}

func TestDecompressionMiddleware(t *testing.T) {
	// Create gzip compressed request body
	var buf bytes.Buffer
	gzipWriter := gzip.NewWriter(&buf)
	gzipWriter.Write([]byte("compressed data"))
	gzipWriter.Close()

	handler := DecompressionMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		w.Write(body)
	}))

	req := httptest.NewRequest("POST", "/test", &buf)
	req.Header.Set("Content-Encoding", "gzip")
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rr.Code)
	}

	if rr.Body.String() != "compressed data" {
		t.Errorf("Expected 'compressed data', got '%s'", rr.Body.String())
	}
}

func TestDecompressionMiddlewareWithInvalidGzip(t *testing.T) {
	handler := DecompressionMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest("POST", "/test", strings.NewReader("not gzip data"))
	req.Header.Set("Content-Encoding", "gzip")
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400 for invalid gzip, got %d", rr.Code)
	}
}
