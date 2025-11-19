package main

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"runtime"
	"syscall"
	"time"

	webview "github.com/webview/webview_go"
)

const (
	appTitle       = "Product Requirements Assistant"
	appWidth       = 1400
	appHeight      = 900
	backendPort    = "8080"
	frontendPort   = "8501"
	startupTimeout = 30 * time.Second
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("Starting Product Requirements Assistant (WebView2 Thick Client)")

	// Find project root
	projectRoot, err := findProjectRoot()
	if err != nil {
		log.Fatalf("Failed to find project root: %v", err)
	}
	log.Printf("Project root: %s", projectRoot)

	// Start backend server
	backendCmd, err := startBackend(projectRoot)
	if err != nil {
		log.Fatalf("Failed to start backend: %v", err)
	}
	defer stopProcess(backendCmd)

	// Wait for backend to be ready
	if !waitForServer(fmt.Sprintf("http://localhost:%s/api/health", backendPort), startupTimeout) {
		log.Fatalf("Backend failed to start within %v", startupTimeout)
	}
	log.Println("Backend server ready")

	// Start frontend server
	frontendCmd, err := startFrontend(projectRoot)
	if err != nil {
		log.Fatalf("Failed to start frontend: %v", err)
	}
	defer stopProcess(frontendCmd)

	// Wait for frontend to be ready
	if !waitForServer(fmt.Sprintf("http://localhost:%s", frontendPort), startupTimeout) {
		log.Fatalf("Frontend failed to start within %v", startupTimeout)
	}
	log.Println("Frontend server ready")

	// Create WebView window
	debug := os.Getenv("DEBUG") == "true"
	w := webview.New(debug)
	defer w.Destroy()

	w.SetTitle(appTitle)
	w.SetSize(appWidth, appHeight, webview.HintNone)
	w.Navigate(fmt.Sprintf("http://localhost:%s", frontendPort))

	// Handle graceful shutdown
	go handleShutdown(backendCmd, frontendCmd)

	// Run WebView (blocks until window is closed)
	w.Run()

	log.Println("Application closed")
}

// findProjectRoot finds the project root directory
func findProjectRoot() (string, error) {
	// First, try to get the current working directory (works for go run)
	cwd, err := os.Getwd()
	if err == nil {
		// Check if we're in cmd/webview (development with go run)
		if filepath.Base(cwd) == "webview" {
			return filepath.Abs(filepath.Join(cwd, "../.."))
		}
		// Check if backend exists relative to cwd
		if _, err := os.Stat(filepath.Join(cwd, "backend")); err == nil {
			return filepath.Abs(cwd)
		}
	}

	// Fallback: Get executable directory (for production builds)
	exePath, err := os.Executable()
	if err != nil {
		return "", err
	}
	exeDir := filepath.Dir(exePath)

	// Check if we're in dist/webview
	if filepath.Base(exeDir) == "webview" {
		return filepath.Abs(filepath.Join(exeDir, "../.."))
	}

	// Production mode - assume executable is in project root
	return filepath.Abs(exeDir)
}

// startBackend starts the Go backend server
func startBackend(projectRoot string) (*exec.Cmd, error) {
	backendDir := filepath.Join(projectRoot, "backend")

	cmd := exec.Command("go", "run", ".")
	cmd.Dir = backendDir
	cmd.Env = append(os.Environ(),
		fmt.Sprintf("PORT=%s", backendPort),
		"MOCK_AI_ENABLED=true", // Enable mock AI for thick client
	)

	// Capture output for debugging
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("failed to start backend: %v", err)
	}

	log.Printf("Backend started (PID: %d)", cmd.Process.Pid)
	return cmd, nil
}

// startFrontend starts the Streamlit frontend server
func startFrontend(projectRoot string) (*exec.Cmd, error) {
	frontendDir := filepath.Join(projectRoot, "frontend")
	venvPython := filepath.Join(projectRoot, "venv", "bin", "python")

	// Use venv python if available, otherwise system python
	pythonCmd := "python3"
	if _, err := os.Stat(venvPython); err == nil {
		pythonCmd = venvPython
	}

	cmd := exec.Command(pythonCmd, "-m", "streamlit", "run", "app.py",
		"--server.port", frontendPort,
		"--server.headless", "true",
		"--browser.gatherUsageStats", "false",
	)
	cmd.Dir = frontendDir
	cmd.Env = append(os.Environ(),
		fmt.Sprintf("BACKEND_URL=http://localhost:%s", backendPort),
	)

	// Capture output for debugging
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("failed to start frontend: %v", err)
	}

	log.Printf("Frontend started (PID: %d)", cmd.Process.Pid)
	return cmd, nil
}

// waitForServer waits for a server to become available
func waitForServer(url string, timeout time.Duration) bool {
	deadline := time.Now().Add(timeout)
	client := &http.Client{Timeout: 2 * time.Second}

	for time.Now().Before(deadline) {
		resp, err := client.Get(url)
		if err == nil {
			resp.Body.Close()
			if resp.StatusCode == 200 {
				return true
			}
		}
		time.Sleep(500 * time.Millisecond)
	}
	return false
}

// stopProcess gracefully stops a process
func stopProcess(cmd *exec.Cmd) {
	if cmd == nil || cmd.Process == nil {
		return
	}

	log.Printf("Stopping process (PID: %d)", cmd.Process.Pid)

	// Try graceful shutdown first
	if runtime.GOOS == "windows" {
		cmd.Process.Kill()
	} else {
		cmd.Process.Signal(syscall.SIGTERM)

		// Wait up to 5 seconds for graceful shutdown
		done := make(chan error, 1)
		go func() {
			done <- cmd.Wait()
		}()

		select {
		case <-done:
			log.Printf("Process stopped gracefully (PID: %d)", cmd.Process.Pid)
		case <-time.After(5 * time.Second):
			log.Printf("Process did not stop gracefully, killing (PID: %d)", cmd.Process.Pid)
			cmd.Process.Kill()
		}
	}
}

// handleShutdown handles OS signals for graceful shutdown
func handleShutdown(backendCmd, frontendCmd *exec.Cmd) {
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	log.Println("Shutdown signal received, cleaning up...")
	stopProcess(frontendCmd)
	stopProcess(backendCmd)
	os.Exit(0)
}

// findFreePort finds an available port
func findFreePort() (int, error) {
	listener, err := net.Listen("tcp", ":0")
	if err != nil {
		return 0, err
	}
	defer listener.Close()
	return listener.Addr().(*net.TCPAddr).Port, nil
}
