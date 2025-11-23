# Product Requirements Assistant

[![CI/CD](https://github.com/bordenet/product-requirements-assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/product-requirements-assistant/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/bordenet/product-requirements-assistant/branch/main/graph/badge.svg?token=13a4e0d2-5d04-4b4e-9b0e-d07f16280fa1)](https://codecov.io/gh/bordenet/product-requirements-assistant)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A structured 3-phase workflow tool for creating Product Requirements Documents with AI assistance.

**🌐 [Launch Web App](https://bordenet.github.io/product-requirements-assistant/)**

## Quick Start

**🌐 [Launch Web App](https://bordenet.github.io/product-requirements-assistant/)**

No installation required. Works on any device with a modern browser. All data stored locally in your browser.

## Features

- **3-Phase Workflow**: Initial draft (Claude), review (Gemini), finalization (Claude)
- **Copy/Paste Integration**: Works with Claude Sonnet 4.5 and Gemini 2.5 Pro
- **Local Storage**: Projects stored as JSON with markdown export
- **Privacy-First**: 100% client-side, no server, no tracking

## Screenshots

See the workflow in action with our light-hearted "MonkeyMoonshot" example (Phase 1 workflow):

<details>
<summary>📋 <strong>Step 1: Generate Phase 1 Prompt</strong> - Our tool creates the optimized prompt</summary>

![Tool Phase 1 Prompt](docs/MonkeyMoonshot/01-tool-phase1-prompt.png)

*The tool generates a Phase 1 prompt optimized through evolutionary testing. Copy this prompt.*

</details>

<details>
<summary>🤖 <strong>Step 2: Paste into Claude Code</strong> - Claude generates the initial PRD draft</summary>

![Claude Phase 1 Draft](docs/MonkeyMoonshot/02-claude-phase1-draft.png)

*Paste the prompt into Claude Code (or Claude Sonnet 4.5). Claude begins generating the PRD.*

</details>

<details>
<summary>✍️ <strong>Step 3: Claude Continues</strong> - The PRD draft continues</summary>

![Claude Phase 1 Continued](docs/MonkeyMoonshot/03-claude-phase1-continued.png)

*Claude continues writing the PRD draft with detailed sections.*

</details>

<details>
<summary>✅ <strong>Step 4: Claude Completes Draft</strong> - The initial PRD is complete</summary>

![Claude Phase 1 Complete](docs/MonkeyMoonshot/04-claude-phase1-complete.png)

*Claude finishes the initial PRD draft. Now copy this entire response.*

</details>

<details>
<summary>📥 <strong>Step 5: Paste Back into Tool</strong> - Begin pasting Claude's response</summary>

![Tool Paste Phase 1 Start](docs/MonkeyMoonshot/05-tool-paste-phase1-start.png)

*Paste Claude's PRD draft back into our tool. The tool captures the response.*

</details>

<details>
<summary>📥 <strong>Step 6: Continue Pasting</strong> - The response continues</summary>

![Tool Paste Phase 1 Continued](docs/MonkeyMoonshot/06-tool-paste-phase1-continued.png)

*Continue pasting the full response from Claude.*

</details>

<details>
<summary>🎯 <strong>Step 7: Ready for Phase 2</strong> - Phase 1 complete, starting Phase 2</summary>

![Phase 2 Ready](docs/MonkeyMoonshot/07-phase2-ready.png)

*Phase 1 is complete! The tool now has Claude's initial PRD draft and you're starting Phase 2 (Gemini review).*

</details>

> **Note:** These screenshots demonstrate the complete Phase 1 workflow: generate prompt in our tool → paste into Claude Code → paste Claude's response back into our tool. The same copy/paste pattern continues for Phase 2 (Gemini review) and Phase 3 (final synthesis).

## How It Works

1. **Create Project**: Enter title, problems, and context
2. **Phase 1**: Copy prompt to Claude Sonnet 4.5, paste response back
3. **Phase 2**: Copy prompt to Gemini 2.5 Pro, paste response back
4. **Phase 3**: Copy prompt to Claude, paste final PRD
5. **Export**: Download as markdown with full revision history

## For Developers

Interested in contributing or running from source? See:

- [Contributing](CONTRIBUTING.md) - Development guidelines
- [Evolutionary Optimization](PROMPT-FOR-GENESIS-EVOLUTIONARY-INTEGRATION.md) - LLM prompt tuning methodology

## Evolutionary Prompt Optimization

This repository contains the authoritative implementation of evolutionary prompt optimization:

- **+31.1% quality improvement** in 20 rounds (data-driven)
- **Objective scoring** with keep/discard logic
- **Proven mutation library** (Top 5 mutations deliver 71-73% of improvement)

Key files:

- `tools/evolutionary-optimizer.js` - Core optimization engine
- `tools/prd-scorer.js` - Objective PRD quality scorer
- `evolutionary-optimization/` - Test cases and results
- [`PROMPT-FOR-GENESIS-EVOLUTIONARY-INTEGRATION.md`](PROMPT-FOR-GENESIS-EVOLUTIONARY-INTEGRATION.md) - Integration guide

## License

MIT License - see [LICENSE](./LICENSE)
