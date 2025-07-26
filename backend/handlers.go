package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

var projects = make(map[string]*Project)

func createProject(w http.ResponseWriter, r *http.Request) {
	var req CreateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	project := &Project{
		ID:          uuid.New().String(),
		Title:       req.Title,
		Description: req.Problems,
		Phase:       1,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		Phases: []Phase{
			{Number: 1, Name: "Claude Initial PRD"},
			{Number: 2, Name: "Gemini Review"},
			{Number: 3, Name: "Claude Comparison"},
		},
	}

	// Load initial prompt
	prompt, _ := loadPrompt("claude_initial")
	project.Phases[0].Prompt = fmt.Sprintf(prompt, req.Title, req.Problems, req.Context)

	projects[project.ID] = project
	saveProject(project)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(project)
}

func getProject(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	projectID := vars["id"]

	project, exists := projects[projectID]
	if !exists {
		// Try to load from disk
		project = loadProject(projectID)
		if project == nil {
			http.Error(w, "Project not found", http.StatusNotFound)
			return
		}
		projects[projectID] = project
	}

	// Ensure prompts are populated for existing projects (backward compatibility)
	ensurePromptsPopulated(project)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(project)
}

func updatePhase(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	projectID := vars["id"]
	phase := vars["phase"]

	project, exists := projects[projectID]
	if !exists {
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	}

	var req UpdatePhaseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	phaseNum := 0
	switch phase {
	case "1":
		phaseNum = 0
	case "2":
		phaseNum = 1
	case "3":
		phaseNum = 2
	default:
		http.Error(w, "Invalid phase", http.StatusBadRequest)
		return
	}

	project.Phases[phaseNum].Content = req.Content
	project.Phases[phaseNum].CompletedAt = time.Now()
	project.UpdatedAt = time.Now()

	// Prepare next phase prompt when current phase is completed
	if phaseNum == 0 && project.Phases[0].Content != "" {
		// Phase 1 completed, prepare Phase 2 prompt
		prompt, _ := loadPrompt("gemini_review")
		prompt = strings.Replace(prompt, "[PASTE CLAUDE'S ORIGINAL PRD HERE]", project.Phases[0].Content, 1)
		project.Phases[1].Prompt = prompt
	} else if phaseNum == 1 && project.Phases[1].Content != "" {
		// Phase 2 completed, prepare Phase 3 prompt
		prompt, _ := loadPrompt("claude_compare")
		if project.Phases[0].Content != "" {
			prompt = strings.Replace(prompt, "[PASTE CLAUDE'S ORIGINAL PRD HERE]", project.Phases[0].Content, 1)
		}
		prompt = strings.Replace(prompt, "[PASTE GEMINI'S PRD RENDITION HERE]", project.Phases[1].Content, 1)
		project.Phases[2].Prompt = prompt
	}

	// Advance to next phase if not final
	if phaseNum < 2 {
		project.Phase = phaseNum + 2
	}

	saveProject(project)
	savePhaseOutput(project, phaseNum)

	// Save final comprehensive PRD when phase 3 is complete
	if phaseNum == 2 && project.Phases[2].Content != "" {
		saveFinalPRD(project)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(project)
}

func getPrompt(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	phase := vars["phase"]

	content, err := loadPrompt(phase)
	if err != nil {
		http.Error(w, "Prompt not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"content": content})
}

func updatePrompt(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	phase := vars["phase"]

	var req PromptUpdate
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := savePromptTemplate(phase, req.Content); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func listProjects(w http.ResponseWriter, r *http.Request) {
	// First, try to load any projects from disk that aren't in memory
	files, err := os.ReadDir("../outputs")
	if err == nil {
		for _, file := range files {
			if strings.HasSuffix(file.Name(), ".json") {
				projectID := strings.TrimSuffix(file.Name(), ".json")
				if _, exists := projects[projectID]; !exists {
					if project := loadProject(projectID); project != nil {
						projects[projectID] = project
					}
				}
			}
		}
	}

	projectList := make([]*Project, 0, len(projects))
	for _, p := range projects {
		projectList = append(projectList, p)
	}

	// Sort by creation date (newest first)
	sort.Slice(projectList, func(i, j int) bool {
		return projectList[i].CreatedAt.After(projectList[j].CreatedAt)
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(projectList)
}

// ensurePromptsPopulated ensures all phase prompts are populated for backward compatibility
func ensurePromptsPopulated(project *Project) {
	// Phase 1: Initial prompt (should always be populated at creation)
	if project.Phases[0].Prompt == "" {
		prompt, _ := loadPrompt("claude_initial")
		project.Phases[0].Prompt = fmt.Sprintf(prompt, project.Title, project.Description, "")
	}

	// Phase 2: Gemini review prompt (populate if Phase 1 is complete)
	if project.Phases[1].Prompt == "" && project.Phases[0].Content != "" {
		prompt, _ := loadPrompt("gemini_review")
		prompt = strings.Replace(prompt, "[PASTE CLAUDE'S ORIGINAL PRD HERE]", project.Phases[0].Content, 1)
		project.Phases[1].Prompt = prompt
	}

	// Phase 3: Comparison prompt (populate if Phases 1 and 2 are complete)
	if project.Phases[2].Prompt == "" && project.Phases[0].Content != "" && project.Phases[1].Content != "" {
		prompt, _ := loadPrompt("claude_compare")
		prompt = strings.Replace(prompt, "[PASTE CLAUDE'S ORIGINAL PRD HERE]", project.Phases[0].Content, 1)
		prompt = strings.Replace(prompt, "[PASTE GEMINI'S PRD RENDITION HERE]", project.Phases[1].Content, 1)
		project.Phases[2].Prompt = prompt
	}
}
