package main

import (
	"embed"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os/exec"
	"runtime"
	"time"
)

//go:embed web/*
var webFiles embed.FS

const (
	PORT = "8080"
)

func main() {
	// Get web files subdirectory
	webFS, err := fs.Sub(webFiles, "web")
	if err != nil {
		log.Fatal(err)
	}

	// Serve embedded web files
	http.Handle("/", http.FileServer(http.FS(webFS)))

	// Health check endpoint
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, "OK")
	})

	// Start server in background
	go func() {
		addr := "localhost:" + PORT
		log.Printf("Starting PRD Assistant on http://%s", addr)
		log.Printf("Press Ctrl+C to stop")
		if err := http.ListenAndServe(addr, nil); err != nil {
			log.Fatal(err)
		}
	}()

	// Wait for server to be ready
	time.Sleep(1 * time.Second)

	// Open browser
	url := "http://localhost:" + PORT
	if err := openBrowser(url); err != nil {
		log.Printf("Server running at %s", url)
		log.Printf("Please open this URL in your browser")
	}

	// Keep running
	select {}
}

// openBrowser opens the default browser to the given URL
func openBrowser(url string) error {
	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("cmd", "/c", "start", url)
	case "darwin":
		cmd = exec.Command("open", url)
	default: // linux, freebsd, openbsd, netbsd
		cmd = exec.Command("xdg-open", url)
	}

	return cmd.Start()
}
