package main

import (
	"encoding/json"
	"fmt"
	"log"
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
		log.Printf("ERROR: Failed to decode request: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Input validation and sanitization
	validator := GetValidator()
	if err := validator.ValidateCreateProjectRequest(&req); err != nil {
		log.Printf("ERROR: Validation failed: %v (Title length: %d, Problems length: %d, Context length: %d)",
			err, len(req.Title), len(req.Problems), len(req.Context))
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
		Phase1LLM: req.Phase1LLM, // Store Phase 1 LLM config
		Phase2LLM: req.Phase2LLM, // Store Phase 2 LLM config
	}

	// Load initial prompt (try new format first, fall back to legacy)
	prompt, err := loadPrompt("phase1-claude-initial")
	if err != nil {
		// Fall back to legacy format
		prompt, err = loadPrompt("claude_initial")
		if err != nil {
			http.Error(w, fmt.Sprintf("Error loading prompt: %v", err), http.StatusInternalServerError)
			return
		}
	}
	project.Phases[0].Prompt = fmt.Sprintf(prompt, req.Title, req.Problems, req.Context)

	projects[project.ID] = project
	saveProject(project)

	// Track business metric
	GetMetrics().IncrementProjectsCreated()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(project)
}

func getProject(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	projectID := vars["id"]

	// Validate project ID
	validator := GetValidator()
	if err := validator.ValidateProjectID(projectID); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

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

	// Validate inputs
	validator := GetValidator()
	if err := validator.ValidateProjectID(projectID); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	phaseNum, err := validator.ValidatePhaseNumber(phase)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

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

	var req UpdatePhaseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Input validation and sanitization
	if err := validator.ValidateUpdatePhaseRequest(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Convert phase number to array index
	phaseIndex := phaseNum - 1

	project.Phases[phaseIndex].Content = req.Content
	project.Phases[phaseIndex].CompletedAt = time.Now()
	project.UpdatedAt = time.Now()

	// Prepare next phase prompt when current phase is completed
	if phaseIndex == 0 && project.Phases[0].Content != "" {
		// Phase 1 completed, prepare Phase 2 prompt
		prompt, err := loadPrompt("gemini_review")
		if err != nil {
			// Log error but continue with default prompt
			fmt.Printf("Warning: Error loading gemini_review prompt: %v\n", err)
			prompt = getDefaultPrompt("gemini_review")
		}
		prompt = strings.Replace(prompt, "[PASTE CLAUDE'S ORIGINAL PRD HERE]", project.Phases[0].Content, 1)

		// Check if same LLM is being used for Phase 1 and Phase 2
		if isSameLLM(project.Phase1LLM, project.Phase2LLM) {
			log.Printf("Same LLM detected for Phase 1 and Phase 2, augmenting Phase 2 prompt with Gemini simulation")
			prompt = augmentPhase2PromptForSameLLM(prompt)
		}

		project.Phases[1].Prompt = prompt
	} else if phaseIndex == 1 && project.Phases[1].Content != "" {
		// Phase 2 completed, prepare Phase 3 prompt
		prompt, err := loadPrompt("phase3-claude-synthesis")
		if err != nil {
			// Fall back to legacy format
			prompt, err = loadPrompt("claude_compare")
			if err != nil {
				// Log error but continue with default prompt
				fmt.Printf("Warning: Error loading phase3 prompt: %v\n", err)
				prompt = getDefaultPrompt("claude_compare")
			}
		}
		if project.Phases[0].Content != "" {
			prompt = strings.Replace(prompt, "[PASTE CLAUDE'S ORIGINAL PRD HERE]", project.Phases[0].Content, 1)
			prompt = strings.Replace(prompt, "{phase1Output}", project.Phases[0].Content, 1)
		}
		prompt = strings.Replace(prompt, "[PASTE GEMINI'S PRD RENDITION HERE]", project.Phases[1].Content, 1)
		prompt = strings.Replace(prompt, "{phase2Output}", project.Phases[1].Content, 1)
		project.Phases[2].Prompt = prompt
	}

	// Advance to next phase if not final
	if phaseIndex < 2 {
		project.Phase = phaseIndex + 2
	}

	saveProject(project)
	savePhaseOutput(project, phaseIndex)

	// Track business metric
	GetMetrics().IncrementPhasesUpdated()

	// Save final comprehensive PRD when phase 3 is complete
	if phaseIndex == 2 && project.Phases[2].Content != "" {
		saveFinalPRD(project)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(project)
}

func getPrompt(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	phase := vars["phase"]

	// Validate phase name
	validator := GetValidator()
	if err := validator.ValidatePromptPhase(phase); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

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

	// Validate phase name
	validator := GetValidator()
	if err := validator.ValidatePromptPhase(phase); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var req PromptUpdate
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Validate and sanitize prompt content
	if err := validator.ValidatePromptUpdate(&req); err != nil {
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
	files, err := os.ReadDir(getOutputsDir())
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
		prompt, err := loadPrompt("phase1-claude-initial")
		if err != nil {
			// Fall back to legacy format
			prompt, err = loadPrompt("claude_initial")
			if err != nil {
				prompt = getDefaultPrompt("claude_initial")
			}
		}
		project.Phases[0].Prompt = fmt.Sprintf(prompt, project.Title, project.Description, "")
	}

	// Phase 2: Gemini review prompt (populate if Phase 1 is complete)
	if project.Phases[1].Prompt == "" && project.Phases[0].Content != "" {
		prompt, err := loadPrompt("phase2-gemini-review")
		if err != nil {
			// Fall back to legacy format
			prompt, err = loadPrompt("gemini_review")
			if err != nil {
				prompt = getDefaultPrompt("gemini_review")
			}
		}
		// Replace both old and new placeholder formats
		prompt = strings.ReplaceAll(prompt, "[PASTE CLAUDE'S ORIGINAL PRD HERE]", project.Phases[0].Content)
		prompt = strings.ReplaceAll(prompt, "{phase1Output}", project.Phases[0].Content)
		project.Phases[1].Prompt = prompt
	}

	// Phase 3: Comparison prompt (populate if Phases 1 and 2 are complete)
	if project.Phases[2].Prompt == "" && project.Phases[0].Content != "" && project.Phases[1].Content != "" {
		prompt, err := loadPrompt("phase3-claude-synthesis")
		if err != nil {
			// Fall back to legacy format
			prompt, err = loadPrompt("claude_compare")
			if err != nil {
				prompt = getDefaultPrompt("claude_compare")
			}
		}
		prompt = strings.Replace(prompt, "[PASTE CLAUDE'S ORIGINAL PRD HERE]", project.Phases[0].Content, 1)
		prompt = strings.Replace(prompt, "{phase1Output}", project.Phases[0].Content, 1)
		prompt = strings.Replace(prompt, "[PASTE GEMINI'S PRD RENDITION HERE]", project.Phases[1].Content, 1)
		prompt = strings.Replace(prompt, "{phase2Output}", project.Phases[1].Content, 1)
		project.Phases[2].Prompt = prompt
	}
}

// generateMockResponse generates a mock AI response for testing
func generateMockResponse(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	projectID := vars["id"]
	phaseStr := vars["phase"]

	// Check if mock AI is enabled
	mockAI := GetMockAI()
	if mockAI == nil || !mockAI.IsEnabled() {
		http.Error(w, "Mock AI is not enabled. Set MOCK_AI_ENABLED=true to use this feature.", http.StatusForbidden)
		return
	}

	// Validate project ID
	validator := GetValidator()
	if err := validator.ValidateProjectID(projectID); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Validate phase number
	phaseNum, err := validator.ValidatePhaseNumber(phaseStr)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get project
	project, exists := projects[projectID]
	if !exists {
		project = loadProject(projectID)
		if project == nil {
			http.Error(w, "Project not found", http.StatusNotFound)
			return
		}
		projects[projectID] = project
	}

	// Determine which phase we're generating for
	var mockResponse string
	switch phaseNum {
	case 1:
		// Generate Phase 1 (Claude Initial PRD)
		mockResponse = mockAI.GeneratePhase1Response(project.Title, project.Description, "")
		project.Phases[0].Content = mockResponse
		project.Phases[0].CompletedAt = time.Now()
		project.Phase = 2

		// Populate Phase 2 prompt
		prompt, err := loadPrompt("gemini_review")
		if err != nil {
			prompt = getDefaultPrompt("gemini_review")
		}
		prompt = strings.Replace(prompt, "[PASTE CLAUDE'S ORIGINAL PRD HERE]", mockResponse, 1)
		project.Phases[1].Prompt = prompt

	case 2:
		// Generate Phase 2 (Gemini Review)
		if project.Phases[0].Content == "" {
			http.Error(w, "Phase 1 must be completed before generating Phase 2", http.StatusBadRequest)
			return
		}
		mockResponse = mockAI.GeneratePhase2Response(project.Title, project.Phases[0].Content)
		project.Phases[1].Content = mockResponse
		project.Phases[1].CompletedAt = time.Now()
		project.Phase = 3

		// Populate Phase 3 prompt
		prompt, err := loadPrompt("phase3-claude-synthesis")
		if err != nil {
			// Fall back to legacy format
			prompt, err = loadPrompt("claude_compare")
			if err != nil {
				prompt = getDefaultPrompt("claude_compare")
			}
		}
		prompt = strings.Replace(prompt, "[PASTE CLAUDE'S ORIGINAL PRD HERE]", project.Phases[0].Content, 1)
		prompt = strings.Replace(prompt, "{phase1Output}", project.Phases[0].Content, 1)
		prompt = strings.Replace(prompt, "[PASTE GEMINI'S PRD RENDITION HERE]", mockResponse, 1)
		prompt = strings.Replace(prompt, "{phase2Output}", mockResponse, 1)
		project.Phases[2].Prompt = prompt

	case 3:
		// Generate Phase 3 (Claude Comparison)
		if project.Phases[0].Content == "" || project.Phases[1].Content == "" {
			http.Error(w, "Phases 1 and 2 must be completed before generating Phase 3", http.StatusBadRequest)
			return
		}
		mockResponse = mockAI.GeneratePhase3Response(project.Title, project.Phases[0].Content, project.Phases[1].Content)
		project.Phases[2].Content = mockResponse
		project.Phases[2].CompletedAt = time.Now()
		project.Phase = 3 // Stay at phase 3 (complete)

	default:
		http.Error(w, "Invalid phase number", http.StatusBadRequest)
		return
	}

	// Update project timestamp
	project.UpdatedAt = time.Now()

	// Save project and phase output
	saveProject(project)
	savePhaseOutput(project, phaseNum-1)

	// If all phases complete, save final PRD
	if project.Phases[0].Content != "" && project.Phases[1].Content != "" && project.Phases[2].Content != "" {
		saveFinalPRD(project)
	}

	log.Printf("Generated mock response for project %s, phase %s", projectID, phaseStr)

	// Return the updated project
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(project)
}

// isSameLLM detects if Phase 1 and Phase 2 use the same LLM
func isSameLLM(phase1LLM, phase2LLM *LLMConfig) bool {
	// If either config is nil, assume different LLMs (default behavior)
	if phase1LLM == nil || phase2LLM == nil {
		return false
	}

	// Check if provider AND model match
	if phase1LLM.Provider != "" && phase2LLM.Provider != "" &&
		phase1LLM.Model != "" && phase2LLM.Model != "" {
		if phase1LLM.Provider == phase2LLM.Provider && phase1LLM.Model == phase2LLM.Model {
			return true
		}
	}

	// Check if URL matches
	if phase1LLM.URL != "" && phase2LLM.URL != "" {
		if phase1LLM.URL == phase2LLM.URL {
			return true
		}
	}

	// Check if endpoint matches
	if phase1LLM.Endpoint != "" && phase2LLM.Endpoint != "" {
		if phase1LLM.Endpoint == phase2LLM.Endpoint {
			return true
		}
	}

	return false
}

// getGeminiSimulationTemplate returns the Gemini personality simulation template
func getGeminiSimulationTemplate() string {
	return `
## ADVERSARIAL REVIEWER ROLE (GEMINI-STYLE SIMULATION)

You are now operating as Google Gemini, Google's flagship analytical LLM known for rigorous, constructively adversarial analysis. Completely abandon your previous conversational style and adopt Gemini's characteristic approach:

**GEMINI BEHAVIORAL PROFILE**:
- Highly analytical and precision-focused
- Constructively adversarial and skeptical by design
- Evidence-demanding and assumption-challenging
- Systematic in identifying logical gaps and inconsistencies
- Professional but relentlessly thorough in critique

**YOUR GEMINI MISSION**:
Critically analyze the provided document as if you are professionally required to find every possible weakness, inconsistency, gap in logic, unwarranted assumption, ambiguous phrasing, or potential contradiction.

**ADOPT GEMINI'S ANALYTICAL MINDSET**:
1. **Skeptical Precision**: Approach every claim with professional skepticism
2. **Evidence Demands**: Question assertions that lack substantiating evidence
3. **Assumption Challenges**: Identify and probe hidden assumptions
4. **Logic Gaps**: Systematically identify incomplete arguments or reasoning flaws
5. **Clarity Demands**: Highlight vagueness, ambiguity, or potential misinterpretation

**GEMINI'S ADVERSARIAL APPROACH**:
- Challenge everything while remaining constructively professional
- Stress-test the document to make it more robust and rigorous
- Identify areas where a discerning reader might be confused or misled
- Provide detailed critiques with specific section references
- Generate follow-up questions a critical reviewer would ask

**DELIVER AS GEMINI WOULD**:
Your response should read as if generated by Google Gemini's adversarial analysis engine. Focus on constructive criticism, logical rigor, and systematic improvement suggestions. Maintain Gemini's characteristic analytical tone throughout your critique.

**CRITICAL**: This is NOT a "review and improve" task. This is a "challenge and reconstruct" task. Offer a genuinely different analytical perspective that creates productive tension with the original approach.

---

`
}

// augmentPhase2PromptForSameLLM augments Phase 2 prompt with Gemini simulation when same LLM detected
func augmentPhase2PromptForSameLLM(originalPrompt string) string {
	// Find the "Forget" clause - handle multiple variations
	// We need to insert the Gemini simulation AFTER this clause
	forgetClauses := []string{
		"Forget all previous sessions and context.",
		"Forget our previous sessions-- start fresh with me.",
	}

	for _, forgetClause := range forgetClauses {
		if strings.Contains(originalPrompt, forgetClause) {
			// Find the position after the forget clause
			parts := strings.SplitN(originalPrompt, forgetClause, 2)
			if len(parts) == 2 {
				// Insert Gemini simulation after the forget clause
				return parts[0] + forgetClause + "\n\n" + getGeminiSimulationTemplate() + parts[1]
			}
		}
	}

	// If no forget clause found, prepend the Gemini simulation
	return getGeminiSimulationTemplate() + originalPrompt
}
