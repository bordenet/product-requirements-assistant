package main

import (
	"strings"
	"testing"
)

func TestValidateCreateProjectRequest(t *testing.T) {
	validator := NewInputValidator()

	tests := []struct {
		name      string
		req       CreateProjectRequest
		expectErr bool
	}{
		{
			name: "Valid request",
			req: CreateProjectRequest{
				Title:    "Test Product",
				Problems: "Users need a solution",
				Context:  "Enterprise environment",
			},
			expectErr: false,
		},
		{
			name: "Empty title",
			req: CreateProjectRequest{
				Title:    "",
				Problems: "Users need a solution",
				Context:  "Enterprise environment",
			},
			expectErr: true,
		},
		{
			name: "Whitespace only title",
			req: CreateProjectRequest{
				Title:    "   ",
				Problems: "Users need a solution",
				Context:  "Enterprise environment",
			},
			expectErr: true,
		},
		{
			name: "Empty problems",
			req: CreateProjectRequest{
				Title:    "Test Product",
				Problems: "",
				Context:  "Enterprise environment",
			},
			expectErr: true,
		},
		{
			name: "Title too long",
			req: CreateProjectRequest{
				Title:    strings.Repeat("a", 300),
				Problems: "Users need a solution",
				Context:  "Enterprise environment",
			},
			expectErr: true,
		},
		{
			name: "Problems too long",
			req: CreateProjectRequest{
				Title:    "Test Product",
				Problems: strings.Repeat("a", 100001),
				Context:  "Enterprise environment",
			},
			expectErr: true,
		},
		{
			name: "Context too long",
			req: CreateProjectRequest{
				Title:    "Test Product",
				Problems: "Users need a solution",
				Context:  strings.Repeat("a", 50001),
			},
			expectErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validator.ValidateCreateProjectRequest(&tt.req)
			if (err != nil) != tt.expectErr {
				t.Errorf("ValidateCreateProjectRequest() error = %v, expectErr %v", err, tt.expectErr)
			}
		})
	}
}

func TestValidateUpdatePhaseRequest(t *testing.T) {
	validator := NewInputValidator()

	tests := []struct {
		name      string
		req       UpdatePhaseRequest
		expectErr bool
	}{
		{
			name: "Valid request",
			req: UpdatePhaseRequest{
				Content: "# Test PRD\n\nThis is valid content.",
			},
			expectErr: false,
		},
		{
			name: "Empty content",
			req: UpdatePhaseRequest{
				Content: "",
			},
			expectErr: true,
		},
		{
			name: "Whitespace only content",
			req: UpdatePhaseRequest{
				Content: "   \n\n   ",
			},
			expectErr: true,
		},
		{
			name: "Content too large",
			req: UpdatePhaseRequest{
				Content: strings.Repeat("a", 300000),
			},
			expectErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validator.ValidateUpdatePhaseRequest(&tt.req)
			if (err != nil) != tt.expectErr {
				t.Errorf("ValidateUpdatePhaseRequest() error = %v, expectErr %v", err, tt.expectErr)
			}
		})
	}
}

func TestValidatePromptUpdate(t *testing.T) {
	validator := NewInputValidator()

	tests := []struct {
		name      string
		req       PromptUpdate
		expectErr bool
	}{
		{
			name: "Valid prompt update",
			req: PromptUpdate{
				Content: "This is a valid prompt template.",
			},
			expectErr: false,
		},
		{
			name: "Empty prompt",
			req: PromptUpdate{
				Content: "",
			},
			expectErr: true,
		},
		{
			name: "Whitespace only prompt",
			req: PromptUpdate{
				Content: "   \n\n   ",
			},
			expectErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validator.ValidatePromptUpdate(&tt.req)
			if (err != nil) != tt.expectErr {
				t.Errorf("ValidatePromptUpdate() error = %v, expectErr %v", err, tt.expectErr)
			}
		})
	}
}
