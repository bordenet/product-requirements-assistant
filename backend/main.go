package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os"

    "github.com/gorilla/mux"
    "github.com/rs/cors"
)

func main() {
    // Ensure directories exist
    os.MkdirAll("../inputs", 0755)
    os.MkdirAll("../outputs", 0755)
    os.MkdirAll("../prompts", 0755)

    router := mux.NewRouter()
    
    // API routes
    router.HandleFunc("/api/health", healthCheck).Methods("GET")
    router.HandleFunc("/api/projects", createProject).Methods("POST")
    router.HandleFunc("/api/projects/{id}", getProject).Methods("GET")
    router.HandleFunc("/api/projects/{id}/phase/{phase}", updatePhase).Methods("POST")
    router.HandleFunc("/api/prompts/{phase}", getPrompt).Methods("GET")
    router.HandleFunc("/api/prompts/{phase}", updatePrompt).Methods("POST")
    router.HandleFunc("/api/projects", listProjects).Methods("GET")
    
    // Enable CORS for Streamlit
    c := cors.New(cors.Options{
        AllowedOrigins: []string{"http://localhost:8501"},
        AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
        AllowedHeaders: []string{"*"},
    })
    
    handler := c.Handler(router)
    
    fmt.Println("Product Requirements Assistant Backend running on :8080")
    log.Fatal(http.ListenAndServe(":8080", handler))
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
    json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
}
