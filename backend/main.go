package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
	// Load and validate configuration
	config, err := LoadConfig()
	if err != nil {
		log.Fatalf("Configuration error: %v", err)
	}

	// Print configuration
	PrintConfiguration(config)

	// Validate directory structure
	if err := ValidateDirectoryStructure(); err != nil {
		log.Fatalf("Directory validation error: %v", err)
	}

	// Validate prompt files
	if err := ValidatePromptFiles(); err != nil {
		log.Fatalf("Prompt files validation error: %v", err)
	}

	// Validate system resources
	if err := ValidateSystemResources(); err != nil {
		log.Fatalf("System resources validation error: %v", err)
	}

	// Initialize file manager for performance optimization
	InitFileManager()

	// Initialize metrics collector
	InitMetrics()

	// Initialize mock AI generator
	InitMockAI(config.MockAIEnabled)

	// Create rate limiter with config
	rateLimiter := NewRateLimiter(config.RateLimit, time.Minute)

	router := mux.NewRouter()

	// API routes
	router.HandleFunc("/api/health", healthCheck).Methods("GET")
	router.HandleFunc("/api/projects", createProject).Methods("POST")
	router.HandleFunc("/api/projects/{id}", getProject).Methods("GET")
	router.HandleFunc("/api/projects/{id}/phase/{phase}", updatePhase).Methods("POST")
	router.HandleFunc("/api/prompts/{phase}", getPrompt).Methods("GET")
	router.HandleFunc("/api/prompts/{phase}", updatePrompt).Methods("POST")
	router.HandleFunc("/api/projects", listProjects).Methods("GET")
	router.HandleFunc("/api/projects/{id}/generate/{phase}", generateMockResponse).Methods("POST")

	// Monitoring routes
	router.HandleFunc("/api/metrics", metricsHandler).Methods("GET")
	router.HandleFunc("/api/healthz", healthzHandler).Methods("GET")
	router.HandleFunc("/api/readiness", readinessHandler).Methods("GET")

	// Use config for allowed origins
	allowedOrigins := config.AllowedOrigins

	// Enable CORS with proper validation
	c := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: false,
	})

	// Apply middleware stack (order matters!)
	handler := c.Handler(router)
	handler = LoggingMiddleware(handler)
	handler = MetricsMiddleware(handler)
	handler = CompressionMiddleware(handler)
	handler = DecompressionMiddleware(handler)
	handler = RequestSizeLimit(config.MaxRequestSize)(handler)
	handler = rateLimiter.Middleware()(handler)

	port := config.Port

	// Create HTTP server with timeouts
	server := &http.Server{
		Addr:         ":" + port,
		Handler:      handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Product Requirements Assistant Backend starting on port %s", port)
		log.Printf("Allowed CORS origins: %v", allowedOrigins)

		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Give outstanding requests 30 seconds to complete
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Shutdown file manager
	if globalFileManager != nil {
		globalFileManager.Stop()
		log.Println("File manager stopped")
	}

	// Shutdown server
	if err := server.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	} else {
		log.Println("Server gracefully stopped")
	}
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
}
