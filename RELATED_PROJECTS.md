# Related Projects

This document links to related projects in the ecosystem.

---

## Product Requirements Assistant

**Purpose**: 3-phase AI workflow for creating Product Requirements Documents  
**GitHub**: https://github.com/bordenet/product-requirements-assistant  
**Live App**: https://bordenet.github.io/product-requirements-assistant/  
**Status**: ✅ Production - Gold Standard Reference Implementation

**Description**: AI-powered tool using Claude Sonnet 4.5 and Gemini 2.5 Pro in a 3-phase workflow to create comprehensive Product Requirements Documents. Features include:
- Phase 1: Initial PRD creation with Claude
- Phase 2: Critical review and enhancement with Gemini
- Phase 3: Final synthesis and refinement with Claude
- 100% client-side processing (privacy-first)
- No server required
- Automated deployment to GitHub Pages

---

## One-Pager

**Purpose**: AI-powered one-page document generator  
**GitHub**: https://github.com/bordenet/one-pager  
**Live App**: https://bordenet.github.io/one-pager/  
**Status**: ✅ Production

**Description**: Streamlined tool for creating concise one-page documents using AI. Features include:
- Single-phase AI workflow
- Customizable templates
- Markdown-based prompts
- Client-side processing
- GitHub Pages deployment

---

## Genesis

**Purpose**: Project template system for bootstrapping new AI-powered web applications  
**GitHub**: https://github.com/bordenet/genesis  
**Status**: 🔧 Template System (not deployed)

**Description**: Meta-template system that generates new projects with best practices built-in. Features include:
- AI-executable instructions
- Deployment automation templates
- Quality standards enforcement
- Continuous improvement documentation
- Example projects (hello-world)
- Placeholder-based templating system

**Key Templates**:
- `deploy-web.sh.template` - GitHub Pages deployment
- `compact.sh` - Minimal vertical output library
- `CLAUDE.md.template` - AI assistant instructions
- Project structure templates

---

## Navigation

- **From Product Requirements Assistant** → [One-Pager](https://bordenet.github.io/one-pager/) | [Genesis](https://github.com/bordenet/genesis)
- **From One-Pager** → [Product Requirements Assistant](https://bordenet.github.io/product-requirements-assistant/) | [Genesis](https://github.com/bordenet/genesis)
- **From Genesis** → [Product Requirements Assistant](https://bordenet.github.io/product-requirements-assistant/) | [One-Pager](https://bordenet.github.io/one-pager/)

---

## Continuous Improvement Flow

```
Product Requirements Assistant (gold standard)
    ↓ innovations
One-Pager (sibling project)
    ↓ best practices extracted
Genesis (template system)
    ↓ templates applied
New Projects (inherit best practices)
```

**Process**:
1. Innovations developed in product-requirements-assistant or one-pager
2. Best practices documented in `docs/continuous-improvement/`
3. Templates updated in genesis
4. All future projects inherit improvements automatically

---

## Common Features

All projects share:
- ✅ Deployment automation (`scripts/deploy-web.sh`)
- ✅ Compact output library (`scripts/lib/compact.sh`)
- ✅ AI assistant instructions (`CLAUDE.md`)
- ✅ GitHub Pages hosting
- ✅ Client-side processing (privacy-first)
- ✅ No backend servers required
- ✅ Markdown-based prompts
- ✅ Quality standards enforcement

---

**Last Updated**: 2025-11-21
