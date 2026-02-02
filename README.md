# Product Requirements Assistant

Write PRDs with AI. Three phases: draft, review, refine.

[![Star this repo](https://img.shields.io/github/stars/bordenet/product-requirements-assistant?style=social)](https://github.com/bordenet/product-requirements-assistant)

**Try it**: [bordenet.github.io/product-requirements-assistant](https://bordenet.github.io/product-requirements-assistant/)

> **What is a PRD?** A [Product Requirements Document](https://en.wikipedia.org/wiki/Product_requirements_document) defines what a product should do and why. It specifies user needs, features, constraints, and success criteria—without prescribing implementation. PRDs align engineering, design, and business before development begins.

[![CI](https://github.com/bordenet/product-requirements-assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/product-requirements-assistant/actions)
[![codecov](https://codecov.io/gh/bordenet/product-requirements-assistant/branch/main/graph/badge.svg)](https://codecov.io/gh/bordenet/product-requirements-assistant)

---

## Quick Start

1. Open the [demo](https://bordenet.github.io/product-requirements-assistant/)
2. Enter product context, user needs, requirements
3. Copy prompt → paste into Claude → paste response back
4. Repeat for review (Gemini) and synthesis (Claude)
5. Export as Markdown

## What It Does

- **Draft → Review → Synthesize**: Claude writes, Gemini critiques, Claude refines
- **Browser storage**: Data stays in IndexedDB, nothing leaves your machine
- **No login**: Just open and use
- **Dark mode**: Toggle in the UI

## How the Phases Work

**Phase 1** — You describe the product. Claude drafts a PRD.

**Phase 2** — Gemini reviews: What's ambiguous? What edge cases are missing? What requirements conflict?

**Phase 3** — Claude takes the draft plus critique and produces a final version.

## Usage

1. Open the app
2. Click "New Project", fill in your inputs
3. Copy each phase's prompt to the appropriate AI, paste responses back
4. Export when done

**Mock mode**: On localhost, toggle "AI Mock Mode" (bottom-right) to skip the copy/paste loop. Useful for testing.

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/bordenet/product-requirements-assistant.git
cd product-requirements-assistant
npm install
```

### Testing

```bash
npm test        # Run all tests
npm run lint    # Run linting
npm run lint:fix # Fix lint issues
```

### Local Development

```bash
npm run serve   # Start local server at http://localhost:8000
```

## Project Structure

```
product-requirements-assistant/
├── js/                    # JavaScript modules
│   ├── app.js            # Main application entry
│   ├── workflow.js       # Phase orchestration
│   ├── storage.js        # IndexedDB operations
│   └── ...
├── tests/                 # Jest test files
├── prompts/              # AI prompt templates
│   ├── phase1.md
│   ├── phase2.md
│   └── phase3.md
└── index.html            # Main HTML file
```

## Part of Genesis Tools

Built with [Genesis](https://github.com/bordenet/genesis). Related tools:

- [One-Pager](https://github.com/bordenet/one-pager)
- [Power Statement Assistant](https://github.com/bordenet/power-statement-assistant)
- [PR/FAQ Assistant](https://github.com/bordenet/pr-faq-assistant)
- [Product Requirements Assistant](https://github.com/bordenet/product-requirements-assistant)
- [Strategic Proposal](https://github.com/bordenet/strategic-proposal)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE)
