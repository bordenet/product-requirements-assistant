package main

import (
    "encoding/json"
    "log"
    "net/http"
    "os"
    "path/filepath"
    "strings"
    "time"

    "github.com/gorilla/mux"
    "github.com/rs/cors"
)

func main() {
    // Get absolute paths for directories
    workDir, err := os.Getwd()
    if err != nil {
        log.Fatal("Failed to get working directory:", err)
    }
    
    projectRoot := filepath.Dir(workDir)
    inputsDir := filepath.Join(projectRoot, "inputs")
    outputsDir := filepath.Join(projectRoot, "outputs")
    promptsDir := filepath.Join(projectRoot, "prompts")
    
    // Ensure directories exist with absolute paths
    os.MkdirAll(inputsDir, 0755)
    os.MkdirAll(outputsDir, 0755)
    os.MkdirAll(promptsDir, 0755)
    
    log.Printf("Using directories: inputs=%s, outputs=%s, prompts=%s", inputsDir, outputsDir, promptsDir)

    // Create rate limiter (100 requests per minute per IP)
    rateLimiter := NewRateLimiter(100, time.Minute)
    
    router := mux.NewRouter()
    
    // API routes
    router.HandleFunc("/api/health", healthCheck).Methods("GET")
    router.HandleFunc("/api/projects", createProject).Methods("POST")
    router.HandleFunc("/api/projects/{id}", getProject).Methods("GET")
    router.HandleFunc("/api/projects/{id}/phase/{phase}", updatePhase).Methods("POST")
    router.HandleFunc("/api/prompts/{phase}", getPrompt).Methods("GET")
    router.HandleFunc("/api/prompts/{phase}", updatePrompt).Methods("POST")
    router.HandleFunc("/api/projects", listProjects).Methods("GET")
    
    // Get allowed origins from environment or use defaults
    allowedOrigins := []string{"http://localhost:8501"}
    if origins := os.Getenv("ALLOWED_ORIGINS"); origins != "" {
        allowedOrigins = strings.Split(origins, ",")
        for i, origin := range allowedOrigins {
            allowedOrigins[i] = strings.TrimSpace(origin)
        }
    }
    
    // Enable CORS with proper validation
    c := cors.New(cors.Options{
        AllowedOrigins: allowedOrigins,
        AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
        AllowedHeaders: []string{"Content-Type", "Authorization"},
        AllowCredentials: false,
    })
    
    // Apply middleware stack
    handler := c.Handler(router)
    handler = LoggingMiddleware(handler)
    handler = RequestSizeLimit(10 * 1024 * 1024)(handler) // 10MB limit
    handler = rateLimiter.Middleware()(handler)
    
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }
    
    log.Printf("Product Requirements Assistant Backend starting on port %s", port)
    log.Printf("Allowed CORS origins: %v", allowedOrigins)
    log.Fatal(http.ListenAndServe(":"+port, handler))
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
    json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
}
