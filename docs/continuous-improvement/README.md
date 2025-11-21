# Continuous Improvement Documentation

This directory contains continuous improvement documents that capture lessons learned, gaps identified, and solutions implemented across the project ecosystem.

## Purpose

These documents serve multiple purposes:

1. **Knowledge Transfer**: Document what went wrong and how it was fixed
2. **Cross-Repository Implementation**: Provide instructions for implementing improvements in related repositories
3. **AI Assistant Guidance**: Give AI assistants clear, executable instructions for implementing changes
4. **Historical Record**: Track evolution of project infrastructure and standards
5. **Prevention**: Ensure similar gaps don't occur in future projects

## Document Structure

Each continuous improvement document follows this structure:

### 1. Problem Statement
- What was the issue?
- Why is it important?
- What was the impact?

### 2. Solution Implemented
- What was built/fixed?
- How does it work?
- Where is the reference implementation?

### 3. Action Items
- What needs to be done in other repositories?
- Specific instructions for AI assistants
- Verification checklists

### 4. Lessons Learned
- What went wrong?
- How do we prevent this in the future?
- What systemic changes are needed?

### 5. Reference Implementation
- Source repository and commit
- Key files and line counts
- Testing commands

## How to Use These Documents

### For Human Developers

1. Read the problem statement to understand context
2. Review the solution to see what was implemented
3. Follow action items for related repositories
4. Apply lessons learned to future work

### For AI Assistants

When you encounter a continuous improvement document:

1. **Read the entire document** before taking action
2. **Identify which repository** you're currently working in
3. **Follow the specific instructions** for that repository
4. **Use the reference implementation** as your source of truth
5. **Verify all checklist items** before marking work complete
6. **Update documentation** to reference the improvements
7. **Test thoroughly** before committing

**Critical**: These documents are written FOR AI CONSUMPTION. They contain:
- Explicit file paths and line numbers
- Complete command examples
- Verification checklists
- Cross-references to related files
- Template placeholders and substitution instructions

## Current Documents

### [web-deployment-script.md](./web-deployment-script.md)

**Issue**: Missing automated web deployment script for GitHub Pages  
**Severity**: Major oversight  
**Status**: ✅ Resolved in product-requirements-assistant  
**Action Required**: 
- Implement in `one-pager` repository
- Implement in `genesis` repository (CRITICAL)

**Summary**: We discovered that none of our web-based projects had automated deployment scripts for GitHub Pages. This was a fundamental infrastructure gap. We created `scripts/deploy-web.sh` with manpage-style help, compact output, verbose mode, dry-run mode, and comprehensive validation. This script needs to be implemented in one-pager and added to genesis templates to prevent future projects from having the same gap.

## Adding New Documents

When creating a new continuous improvement document:

1. **Use the template structure** shown above
2. **Be specific and actionable** - AI assistants need explicit instructions
3. **Include verification checklists** - How do we know it's done correctly?
4. **Reference source implementations** - Provide commit hashes and file paths
5. **Document lessons learned** - What systemic changes prevent recurrence?
6. **Write for AI consumption** - Include all cross-references and file paths

### Naming Convention

Use descriptive kebab-case names:
- `web-deployment-script.md` ✅
- `missing-test-coverage.md` ✅
- `security-vulnerability-fix.md` ✅
- `doc.md` ❌ (too vague)
- `fix.md` ❌ (too vague)

### Metadata

Include at the top of each document:
```markdown
**Date**: YYYY-MM-DD
**Issue**: Brief description
**Severity**: Critical | Major | Minor
**Status**: ✅ Resolved | 🚧 In Progress | ⏳ Pending
**Action Required**: What needs to happen next
```

## Related Documentation

- **Genesis Repository**: https://github.com/bordenet/genesis - Project template system
- **One-Pager Repository**: https://github.com/bordenet/one-pager - Sibling project
- **CLAUDE.md**: AI assistant instructions for this repository
- **Quality Standards**: Project-specific quality requirements

## Philosophy

> "Every mistake is an opportunity to improve the system, not just fix the symptom."

We don't just fix bugs - we:
1. Document what went wrong
2. Implement the fix
3. Update templates to prevent recurrence
4. Share knowledge across repositories
5. Improve our processes

This directory is the embodiment of that philosophy.

---

**Last Updated**: 2025-11-21  
**Maintainer**: Matt J Bordenet (@bordenet)

