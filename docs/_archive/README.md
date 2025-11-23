# Archive

Obsolete documentation kept for historical reference.

---

## ⚠️ Important Notice

**These documents are OUTDATED and should NOT be used for current development.**

They are kept here for historical context and to understand past decisions.

For current documentation, see:
- **[Main Documentation Index](../README.md)**
- **[Architecture](../architecture/)**
- **[Deployment](../deployment/)**
- **[Development](../development/)**
- **[Guides](../guides/)**

---

## 📄 Archived Documents

### V1.5 Planning Documents

These documents were created during the planning phase for v1.5 (thick clients). They have been superseded by the actual implementation.

#### [`V1.5_PROPOSAL.md`](./V1.5_PROPOSAL.md)
**Date:** 2024-11-15
**Status:** Superseded by implementation
**Purpose:** Initial proposal for thick client implementation

**Why Archived:**
- Implementation is complete
- Actual implementation differs from proposal
- See [`docs/decisions/THICK_CLIENT_DECISION.md`](../decisions/THICK_CLIENT_DECISION.md) for final decision

---

#### [`V1.5_RECOMMENDATION.md`](./V1.5_RECOMMENDATION.md)
**Date:** 2024-11-15
**Status:** Superseded by implementation
**Purpose:** Recommendation for Electron vs WebView2

**Why Archived:**
- We built BOTH Electron and WebView2 (not just one)
- See [`docs/guides/THICK_CLIENTS_GUIDE.md`](../guides/THICK_CLIENTS_GUIDE.md) for current guide

---

#### [`V1.5_IMPLEMENTATION_STATUS.md`](./V1.5_IMPLEMENTATION_STATUS.md)
**Date:** 2024-11-16
**Status:** Superseded by completion
**Purpose:** Track implementation progress during development

**Why Archived:**
- Implementation is complete
- See [`docs/PROJECT_PLAN.md`](../PROJECT_PLAN.md) for version history

---

#### [`V1.5_SUMMARY.md`](./V1.5_SUMMARY.md)
**Date:** 2024-11-17
**Status:** Superseded by release
**Purpose:** Summary of v1.5 implementation

**Why Archived:**
- v1.5 is released
- See release notes in GitHub Releases

---

### Testing Documents

#### [`TESTING_RESULTS.md`](./TESTING_RESULTS.md)
**Date:** 2024-11-16
**Status:** Outdated
**Purpose:** Test results from early development

**Why Archived:**
- Test suite has evolved significantly
- See [`docs/development/MOCK_AI.md`](../development/MOCK_AI.md) for current testing approach

---

### Implementation Documents

#### [`WINDOWS_THICK_CLIENT.md`](./WINDOWS_THICK_CLIENT.md)
**Date:** 2024-11-16
**Status:** Superseded by multi-platform guide
**Purpose:** Windows-specific thick client documentation

**Why Archived:**
- Merged into comprehensive guide
- See [`docs/guides/THICK_CLIENTS_GUIDE.md`](../guides/THICK_CLIENTS_GUIDE.md) for all platforms

---

#### [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md)
**Date:** 2024-11-19
**Status:** Historical record
**Purpose:** Summary of web app implementation and docs reorganization

**Why Archived:**
- Historical record of implementation work
- Current state is documented in main docs

---

## 📚 Historical Context

### Why We Keep Archives

1. **Historical Reference:** Understand past decisions and evolution
2. **Learning:** See how the project evolved over time
3. **Context:** Understand why certain decisions were made
4. **Accountability:** Track what was planned vs what was built

### What Gets Archived

- Planning documents after implementation
- Status documents after completion
- Outdated guides after updates
- Superseded decisions after changes

### What Gets Deleted

- Nothing! We archive instead of delete
- Helps future contributors understand the project's history

---

## 🔄 Document Lifecycle

```
New Document
    ↓
Active Documentation (in main docs/)
    ↓
Superseded/Outdated
    ↓
Archived (moved to _archive/)
    ↓
Kept Forever (for historical reference)
```

---

## 🔗 Current Documentation

For up-to-date documentation, see:

- **[Main README](../../README.md)** - Project overview
- **[Documentation Index](../README.md)** - Complete documentation index
- **[Architecture](../architecture/)** - System design
- **[Deployment](../deployment/)** - Deployment guides
- **[Development](../development/)** - Development tools
- **[Guides](../guides/)** - User guides
- **[Decisions](../decisions/)** - Design decisions
