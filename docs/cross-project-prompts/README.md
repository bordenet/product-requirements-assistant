# Cross-Project Prompts

This directory contains prompts for integrating evolutionary optimization tooling into other Genesis-based projects.

## 📋 Available Prompts

### Genesis Integration

**Primary (Recommended):**
- **`../../PROMPT-FOR-GENESIS-EVOLUTIONARY-INTEGRATION.md`** (1,063 lines)
  - **Status:** ✅ Current, comprehensive, production-ready
  - **Purpose:** Complete integration guide for Genesis bootstrapper
  - **Emphasis:** COPY existing tools, don't recreate
  - **Use this for:** New Genesis integration work

**Legacy (Reference Only):**
- `PROMPT-FOR-CLAUDE-IN-GENESIS-REPO.md` (611 lines)
  - **Status:** ⚠️ Superseded by PROMPT-FOR-GENESIS-EVOLUTIONARY-INTEGRATION.md
  - **Purpose:** Earlier version of Genesis integration prompt
  - **Keep for:** Historical reference

- `PROMPT-FOR-GENESIS.md` (445 lines)
  - **Status:** ⚠️ Superseded by PROMPT-FOR-GENESIS-EVOLUTIONARY-INTEGRATION.md
  - **Purpose:** Even earlier version of Genesis integration prompt
  - **Keep for:** Historical reference

### One-Pager Integration

- `PROMPT-FOR-CLAUDE-IN-ONE-PAGER-REPO.md` (405 lines)
  - **Status:** ✅ Current
  - **Purpose:** Upgrade one-pager project with evolutionary optimization
  - **Use this for:** Integrating optimization into one-pager repo

- `PROMPT-FOR-ONE-PAGER.md` (277 lines)
  - **Status:** ⚠️ Earlier version
  - **Purpose:** Apply Top 5 mutations to one-pager prompts
  - **Keep for:** Reference

## 🎯 Which Prompt Should I Use?

### For Genesis Integration:
**Use:** `../../PROMPT-FOR-GENESIS-EVOLUTIONARY-INTEGRATION.md` (in project root)

This is the comprehensive, production-ready prompt that:
- Emphasizes COPYING existing tools, not recreating them
- Includes step-by-step file review checklist
- Has explicit warnings against regenerating code
- Contains complete implementation guide (10 steps)
- Includes success criteria and testing checklist

### For One-Pager Integration:
**Use:** `PROMPT-FOR-CLAUDE-IN-ONE-PAGER-REPO.md`

This prompt guides you through:
- Copying tooling from product-requirements-assistant
- Adapting PRD scorer for one-pager format
- Applying Top 5 mutations
- Running 20-round simulation
- Deploying winning mutations

## 📚 Reference

**Authoritative Source:** https://github.com/bordenet/product-requirements-assistant

All prompts reference this repository as the source of truth for:
- Production-validated tooling (526 lines of core optimizer)
- Proven results (+31.1% improvement in 20 rounds)
- Complete documentation
- Test cases and configuration templates

## 🗂️ Organization

These prompts were moved from the project root to `docs/cross-project-prompts/` to:
- Reduce clutter in project root
- Group related cross-project documentation
- Maintain clear information architecture
- Preserve historical versions for reference

## ⚠️ Important Notes

1. **Always use the latest version** - Check file headers for status
2. **Reference the authoritative source** - Clone product-requirements-assistant before starting
3. **Don't recreate code** - Copy existing tools, adapt as needed
4. **Follow the checklist** - Each prompt includes success criteria
