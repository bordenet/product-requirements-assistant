# Prompt Templates

AI prompt templates for the 3-phase PRD generation workflow.

---

## 📋 Overview

The Product Requirements Assistant uses a structured 3-phase workflow with two AI models:

1. **Phase 1:** Claude Sonnet 4.5 generates initial PRD draft
2. **Phase 2:** Gemini 2.5 Pro reviews and refines the draft
3. **Phase 3:** Claude Sonnet 4.5 compares both versions and creates final PRD

Each phase has a corresponding prompt template that guides the AI's behavior.

---

## 📄 Prompt Files

### [`claude_initial.txt`](./claude_initial.txt)

**Phase:** 1 (Initial Draft)  
**AI Model:** Claude Sonnet 4.5  
**Purpose:** Generate the first version of the PRD

**Template Variables:**
- `%s` (1st occurrence) - Project title
- `%s` (2nd occurrence) - Problems to solve
- `%s` (3rd occurrence) - Additional context

**Key Instructions:**
- Act as a principal Product Manager
- Focus on "Why" (business context) and "What" (requirements)
- Avoid "How" (implementation details)
- Add section numbering for ## and ### levels
- No metadata table at top of document
- Ask clarifying questions
- Include success metrics and intended outcomes

**Example Usage:**
```
Title: Mobile App Redesign
Problems: Low user engagement, high bounce rate
Context: Target audience is 18-35 year olds, iOS and Android
```

---

### [`gemini_review.txt`](./gemini_review.txt)

**Phase:** 2 (Review & Refine)  
**AI Model:** Gemini 2.5 Pro  
**Purpose:** Review Claude's draft and create an improved version

**Template Variables:**
- `[PASTE CLAUDE'S ORIGINAL PRD HERE]` - Placeholder for Phase 1 output

**Key Instructions:**
- Start fresh (forget previous sessions)
- Act as a principal-level Product Manager
- No code, JSON schema, or SQL queries
- Distill, simplify, and clarify the original PRD
- Add section numbering for ## and ### levels
- No metadata table at top of document
- Focus on clarity for engineering team

**What Gemini Does:**
- Identifies ambiguities in the original PRD
- Simplifies complex sections
- Adds missing details
- Improves structure and flow
- Ensures success metrics are clear

---

### [`claude_compare.txt`](./claude_compare.txt)

**Phase:** 3 (Final Comparison)  
**AI Model:** Claude Sonnet 4.5  
**Purpose:** Compare both versions and create the final PRD

**Template Variables:**
- `[PASTE CLAUDE'S ORIGINAL PRD HERE]` - Placeholder for Phase 1 output
- `[PASTE GEMINI'S PRD RENDITION HERE]` - Placeholder for Phase 2 output

**Key Instructions:**
- Compare both versions (Claude's original vs Gemini's review)
- Identify areas of conflict or contradiction
- Create a cleaner, simpler, better version
- Include section numbering
- No metadata table at top of document
- Add citation footer linking to this project

**What Claude Does:**
- Merges the best parts of both versions
- Resolves conflicts and contradictions
- Ensures consistency throughout
- Produces a polished, production-ready PRD

**Citation Footer:**
```markdown
---
*This PRD was generated using the Product Requirements Assistant tool. Learn more at: https://github.com/bordenet/product-requirements-assistant*
```

---

## 🔧 Customizing Prompts

### In the UI

1. Navigate to the project in the application
2. Click "Edit Prompts" for any phase
3. Modify the template text
4. Save changes

Changes are saved per-project and don't affect the default templates.

### In the File System

**Desktop App:**
- Default templates: `prompts/` directory
- Project-specific: Stored in project JSON files in `outputs/` directory

**Web App:**
- Default templates: Loaded from [`web/data/prompts.json`](../web/data/prompts.json)
- Project-specific: Stored in browser IndexedDB

### Template Syntax

**Placeholders:**
- `%s` - Replaced with user input (title, problems, context)
- `[PASTE ... HERE]` - Manual placeholder for copy/paste workflow

**Example:**
```
The title of the document will be: %s
```

When user enters "Mobile App Redesign", this becomes:
```
The title of the document will be: Mobile App Redesign
```

---

## 📊 Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ User Input: Title, Problems, Context                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: claude_initial.txt                                 │
│ • Replace %s placeholders with user input                   │
│ • Copy prompt to Claude Sonnet 4.5                          │
│ • Paste response back                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: gemini_review.txt                                  │
│ • Insert Phase 1 response into template                     │
│ • Copy prompt to Gemini 2.5 Pro                             │
│ • Paste response back                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: claude_compare.txt                                 │
│ • Insert both Phase 1 and Phase 2 responses                 │
│ • Copy prompt to Claude Sonnet 4.5                          │
│ • Paste final PRD back                                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Export: Final PRD as Markdown                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Best Practices

### Writing Effective Prompts

1. **Be Specific:** Clearly define the AI's role and constraints
2. **Set Boundaries:** Explicitly state what NOT to do (e.g., "no code")
3. **Request Format:** Specify output format (markdown, section numbering, etc.)
4. **Provide Context:** Give the AI enough information to make good decisions
5. **Iterate:** Test prompts and refine based on results

### Common Customizations

**Add Industry-Specific Context:**
```
You are a principal Product Manager for a [healthcare/fintech/e-commerce] company.
```

**Change Output Format:**
```
Please use bullet points instead of paragraphs for the requirements section.
```

**Add Specific Sections:**
```
Include a "Technical Constraints" section that lists known limitations.
```

**Adjust Tone:**
```
Write in a formal tone suitable for executive review.
```

---

## 🔗 Related Documentation

- **[Architecture](../docs/architecture/ARCHITECTURE.md)** - How prompts are processed
- **[API Reference](../docs/architecture/API.md)** - Prompt endpoints
- **[Mock AI](../docs/development/MOCK_AI.md)** - Testing with mock responses
- **[Web App](../web/README.md)** - How prompts work in the web version

