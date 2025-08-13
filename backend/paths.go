package main

import (
	"os"
	"path/filepath"
	"sync"
)

var (
	projectPaths struct {
		inputs  string
		outputs string
		prompts string
	}
	pathsOnce sync.Once
)

// initializePaths sets up absolute paths for project directories
func initializePaths() {
	pathsOnce.Do(func() {
		workDir, err := os.Getwd()
		if err != nil {
			// Fallback to current directory if we can't determine working dir
			workDir = "."
		}
		
		projectRoot := filepath.Dir(workDir)
		projectPaths.inputs = filepath.Join(projectRoot, "inputs")
		projectPaths.outputs = filepath.Join(projectRoot, "outputs")
		projectPaths.prompts = filepath.Join(projectRoot, "prompts")
	})
}

// getOutputsDir returns the absolute path to the outputs directory
func getOutputsDir() string {
	initializePaths()
	return projectPaths.outputs
}

// getPromptsDir returns the absolute path to the prompts directory
func getPromptsDir() string {
	initializePaths()
	return projectPaths.prompts
}

// getInputsDir returns the absolute path to the inputs directory
func getInputsDir() string {
	initializePaths()
	return projectPaths.inputs
}