package main

import "time"

type Project struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Phase       int       `json:"phase"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Phases      []Phase   `json:"phases"`
}

type Phase struct {
	Number      int       `json:"number"`
	Name        string    `json:"name"`
	Content     string    `json:"content"`
	Prompt      string    `json:"prompt"`
	CompletedAt time.Time `json:"completed_at"`
}

type CreateProjectRequest struct {
	Title    string `json:"title"`
	Problems string `json:"problems"`
	Context  string `json:"context"`
}

type UpdatePhaseRequest struct {
	Content string `json:"content"`
}

type PromptUpdate struct {
	Content string `json:"content"`
}
