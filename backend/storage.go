package main

import (
	"encoding/json"
	"fmt"
	"path/filepath"
	"strings"
	"time"
)

func saveProject(project *Project) error {
	data, err := json.MarshalIndent(project, "", "  ")
	if err != nil {
		return err
	}

	filename := filepath.Join(getOutputsDir(), fmt.Sprintf("%s.json", project.ID))
	fm := GetFileManager()
	return fm.WriteFile(filename, data, 0644)
}

func loadProject(id string) *Project {
	filename := filepath.Join(getOutputsDir(), fmt.Sprintf("%s.json", id))
	fm := GetFileManager()
	data, err := fm.ReadFile(filename)
	if err != nil {
		return nil
	}

	var project Project
	if err := json.Unmarshal(data, &project); err != nil {
		return nil
	}

	return &project
}

func savePhaseOutput(project *Project, phaseNum int) error {
	content := project.Phases[phaseNum].Content
	timestamp := time.Now().Format("2006-01-02_15-04-05")

	// Create a properly formatted markdown document
	var markdown strings.Builder

	// Add document title
	markdown.WriteString(fmt.Sprintf("# %s\n\n", project.Title))

	// Add phase information
	markdown.WriteString(fmt.Sprintf("**Phase %d: %s**\n", phaseNum+1, project.Phases[phaseNum].Name))
	markdown.WriteString(fmt.Sprintf("*Generated: %s*\n\n", time.Now().Format("January 2, 2006 at 3:04 PM")))

	// Add horizontal rule
	markdown.WriteString("---\n\n")

	// Add the actual content
	markdown.WriteString(content)

	// Ensure file ends with newline
	if !strings.HasSuffix(content, "\n") {
		markdown.WriteString("\n")
	}

	filename := filepath.Join(getOutputsDir(),
		fmt.Sprintf("%s_phase%d_%s.md", project.ID, phaseNum+1, timestamp))

	fm := GetFileManager()
	return fm.WriteFile(filename, []byte(markdown.String()), 0644)
}

func saveFinalPRD(project *Project) error {
	if len(project.Phases) < 3 || project.Phases[2].Content == "" {
		return fmt.Errorf("final PRD not ready")
	}

	timestamp := time.Now().Format("2006-01-02_15-04-05")

	// Create comprehensive final document
	var markdown strings.Builder

	// Document header
	markdown.WriteString(fmt.Sprintf("# %s\n\n", project.Title))
	markdown.WriteString(fmt.Sprintf("*Final PRD Generated: %s*\n\n", time.Now().Format("January 2, 2006 at 3:04 PM")))

	// Add table of contents
	markdown.WriteString("## Table of Contents\n\n")
	markdown.WriteString("1. [Final PRD](#final-prd)\n")
	markdown.WriteString("2. [Revision History](#revision-history)\n")
	markdown.WriteString("3. [Phase 1: Initial Claude PRD](#phase-1-initial-claude-prd)\n")
	markdown.WriteString("4. [Phase 2: Gemini Review](#phase-2-gemini-review)\n\n")

	markdown.WriteString("---\n\n")

	// Final PRD
	markdown.WriteString("## Final PRD\n\n")
	markdown.WriteString(project.Phases[2].Content)
	markdown.WriteString("\n\n---\n\n")

	// Revision History
	markdown.WriteString("## Revision History\n\n")
	markdown.WriteString("| Phase | Completed | Description |\n")
	markdown.WriteString("|-------|-----------|-------------|\n")
	for i, phase := range project.Phases {
		if phase.Content != "" {
			markdown.WriteString(fmt.Sprintf("| Phase %d | %s | %s |\n",
				i+1,
				phase.CompletedAt.Format("2006-01-02 15:04"),
				phase.Name))
		}
	}
	markdown.WriteString("\n---\n\n")

	// Include previous phases for reference
	if project.Phases[0].Content != "" {
		markdown.WriteString("## Phase 1: Initial Claude PRD\n\n")
		markdown.WriteString(project.Phases[0].Content)
		markdown.WriteString("\n\n---\n\n")
	}

	if project.Phases[1].Content != "" {
		markdown.WriteString("## Phase 2: Gemini Review\n\n")
		markdown.WriteString(project.Phases[1].Content)
		markdown.WriteString("\n\n")
	}

	filename := filepath.Join(getOutputsDir(),
		fmt.Sprintf("%s_FINAL_%s.md", project.ID, timestamp))

	fm := GetFileManager()
	return fm.WriteFile(filename, []byte(markdown.String()), 0644)
}

func loadPrompt(phase string) (string, error) {
	filename := filepath.Join(getPromptsDir(), fmt.Sprintf("%s.txt", phase))
	fm := GetFileManager()
	data, err := fm.ReadFile(filename)
	if err != nil {
		// Return default prompt if file doesn't exist
		return getDefaultPrompt(phase), nil
	}
	return string(data), nil
}

func savePromptTemplate(phase string, content string) error {
	filename := filepath.Join(getPromptsDir(), fmt.Sprintf("%s.txt", phase))
	fm := GetFileManager()
	return fm.WriteFile(filename, []byte(content), 0644)
}

func getDefaultPrompt(phase string) string {
	switch phase {
	case "claude_initial":
		return `You are a principal Product Manager for a technology company. You will help me build a product requirements document (PRD) for our engineering team to consume.

Ask me questions along the way. Please be sure to add section numbering for ## and ### levels of the resulting markdown. Do not include a document metadata table at the top of the page-- I don't want that.

Remember, we will stick to the "Why" (business context) and the "What" to help our engineers know what to build. Stay completely out of the "How" so we don't hem them in.

Please be sure to add section numbering for ## and ### levels of the resulting markdown. Write this document so that the engineering team has clarity regarding intended outcomes and success metrics.

Ask me questions along the way.

The title of the document will be: %s

The problems we will address and solve include: %s

Here are a bunch of simplifications, considerations, and other associated context you need to be aware of: %s`

	case "gemini_review":
		return `Forget our previous sessions-- start fresh with me. You are a principal-level Product Manager at a technology company. You don't know how to code, and I don't want you to know how to code. Again, don't provide any code or JSON schema or SQL queries, ever. You will help me review a product requirements document (PRD), attached, generated by Claude Opus 4 and help distill it / simplify it / tease critical details out so that we hand a more mature, less ambiguous document to the engineering team.

Please be sure to add section numbering for ## and ### levels of the resulting markdown. Do not include a document metadata table at the top of the page-- I don't want that. Author an improved document so that my engineering team has clarity regarding intended outcomes and success metrics.

Here is the PRD to review:

[PASTE CLAUDE'S PRD HERE]`

	case "claude_compare":
		return `Google Gemini Pro 2.5 just reviewed the PRD we wrote and generated a competing version. Work with me to compare Google Gemini's version of the doc with yours and determine where we can make things cleaner/simpler/better. Identify areas of conflict and/or contradiction so we can create a successor version of the document which I can safely share with the engineering team.

Include section numbers, as we did last time. Please DO NOT include a metadata table on top of the document (author, version, date, etc...)

Here are both versions:

ORIGINAL CLAUDE VERSION:
[PASTE ORIGINAL PRD HERE]

GEMINI REVIEW VERSION:
[PASTE GEMINI'S VERSION HERE]`

	default:
		return ""
	}
}
