package main

import "time"

// LLMConfig holds configuration for an LLM provider
type LLMConfig struct {
	Provider string `json:"provider"` // e.g., "anthropic", "google", "openai"
	Model    string `json:"model"`    // e.g., "claude-3-sonnet", "gemini-2.5-pro"
	URL      string `json:"url"`      // e.g., "https://librechat.company.com/api/chat"
	Endpoint string `json:"endpoint"` // e.g., "localhost:3000"
}

type Project struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Phase       int        `json:"phase"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	Phases      []Phase    `json:"phases"`
	Phase1LLM   *LLMConfig `json:"phase1_llm,omitempty"` // LLM config for Phase 1
	Phase2LLM   *LLMConfig `json:"phase2_llm,omitempty"` // LLM config for Phase 2
}

type Phase struct {
	Number      int       `json:"number"`
	Name        string    `json:"name"`
	Content     string    `json:"content"`
	Prompt      string    `json:"prompt"`
	CompletedAt time.Time `json:"completed_at"`
}

type CreateProjectRequest struct {
	Title     string     `json:"title"`
	Problems  string     `json:"problems"`
	Context   string     `json:"context"`
	Phase1LLM *LLMConfig `json:"phase1_llm,omitempty"` // Optional LLM config for Phase 1
	Phase2LLM *LLMConfig `json:"phase2_llm,omitempty"` // Optional LLM config for Phase 2
}

type UpdatePhaseRequest struct {
	Content string `json:"content"`
}

type PromptUpdate struct {
	Content string `json:"content"`
}
