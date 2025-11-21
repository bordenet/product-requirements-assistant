# Prompt: Integrate Evolutionary Prompt Optimization into Genesis

**For:** Claude working in https://github.com/bordenet/genesis repository
**From:** product-requirements-assistant (authoritative source)
**Repository:** https://github.com/bordenet/product-requirements-assistant
**Status:** ✅ Production-validated, out-of-the-box tooling, +31% quality improvements proven

---

## ⚠️ CRITICAL: DO NOT RECREATE - COPY AND ADOPT

**YOU MUST:**
1. ✅ **CLONE** the product-requirements-assistant repository to review the reference implementation
2. ✅ **COPY** the existing, tested tools EXACTLY as they are (do NOT rewrite them)
3. ✅ **ADOPT** the proven methodology without modification
4. ✅ **REFERENCE** the code in https://github.com/bordenet/product-requirements-assistant for all questions

**YOU MUST NOT:**
1. ❌ **DO NOT** recreate `evolutionary-optimizer.js` from scratch
2. ❌ **DO NOT** rewrite `prd-scorer.js` or other core tools
3. ❌ **DO NOT** "improve" or "enhance" the existing tools
4. ❌ **DO NOT** generate code without first reviewing the reference implementation

**Why:** These tools are production-validated with 526 lines of battle-tested code. Recreating them will introduce bugs and lose proven optimizations.

**How to Proceed:**
```bash
# ═══════════════════════════════════════════════════════════════
# STEP 0: CLONE AND REVIEW THE REFERENCE IMPLEMENTATION FIRST
# ═══════════════════════════════════════════════════════════════

cd /tmp
git clone https://github.com/bordenet/product-requirements-assistant.git
cd product-requirements-assistant

# ═══════════════════════════════════════════════════════════════
# REVIEW EACH FILE BEFORE PROCEEDING
# ═══════════════════════════════════════════════════════════════

# Core optimizer (526 lines) - This is battle-tested code
cat tools/evolutionary-optimizer.js
# ↑ READ THIS ENTIRE FILE - You will COPY it, not recreate it

# PRD Scorer - This is the template for all scorers
cat tools/prd-scorer.js
# ↑ READ THIS ENTIRE FILE - You will ADAPT it for other project types

# Simulation runner - This orchestrates the optimization
cat tools/run-simulation.js
# ↑ READ THIS ENTIRE FILE - You will COPY it, not recreate it

# Batch executor - This runs multiple simulations
cat tools/run-simulations.sh
# ↑ READ THIS ENTIRE FILE - You will COPY it, not recreate it

# Test cases - This is the format for all test scenarios
cat evolutionary-optimization/test-cases.json
# ↑ READ THIS ENTIRE FILE - You will COPY it as a template

# Configuration - These are production-validated settings
cat evolutionary-optimization/config.example.json
# ↑ READ THIS ENTIRE FILE - You will COPY it, not recreate it

# Proven mutations - These are data-backed improvements
cat evolutionary-optimization/README.md
cat evolutionary-optimization/FINAL-REPORT.md
# ↑ READ THESE FILES - They contain the proven mutations to document

# ═══════════════════════════════════════════════════════════════
# ONLY AFTER REVIEWING ALL FILES ABOVE, PROCEED WITH INTEGRATION
# ═══════════════════════════════════════════════════════════════
```

**Your Job is to:**
1. ✅ **COPY** these files into Genesis module structure
2. ✅ **ADAPT** prd-scorer.js for one-pager and COE (keep the structure, change the criteria)
3. ✅ **INTEGRATE** the copied files into Genesis spawn scripts
4. ✅ **DOCUMENT** the proven mutations from the reports
5. ✅ **CREATE** cross-project comparison tools (new functionality)

**Your Job is NOT to:**
1. ❌ Recreate evolutionary-optimizer.js
2. ❌ Rewrite the scoring logic from scratch
3. ❌ "Improve" the existing tools
4. ❌ Generate code without reviewing the reference first

---

## 🎯 Mission

Embed evolutionary prompt optimization machinery into Genesis bootstrapper so that **every spawned project** gains the ability to:

1. ✅ Run rigorous evolutionary optimization on their LLM prompts
2. ✅ Achieve +20-30% quality improvements with objective scoring
3. ✅ Use proven mutation library and test case templates
4. ✅ Generate comprehensive optimization reports
5. ✅ Compare quality across Genesis-spawned projects

**Time Investment:** ~4-6 hours
**Expected ROI:** 8+ hours saved per project per optimization cycle
**Cross-Project Impact:** All Genesis projects (one-pager, COE generator, PRD assistant, etc.)

---

## 📚 Context: What We Just Built

In the **product-requirements-assistant** repo, we completed a comprehensive evolutionary optimization implementation:

### ✅ Production-Validated Results
- **+31.1% quality improvement** in 20 rounds (28 minutes)
- **+33.9% quality improvement** in 40 rounds (56 minutes)
- **Optimal iteration count proven:** 15-20 rounds (diminishing returns after Round 11)
- **Top 5 mutations identified:** Deliver 71-73% of total improvement

### ✅ Complete Tooling Suite
- `tools/evolutionary-optimizer.js` - Core optimization engine (526 lines, production-ready)
- `tools/prd-scorer.js` - Objective PRD quality scorer
- `tools/run-simulation.js` - Simulation runner with keep/discard logic
- `tools/run-simulations.sh` - Batch simulation executor (20-round + 40-round)
- `evolutionary-optimization/test-cases.json` - 8 diverse test scenarios
- `evolutionary-optimization/config.example.json` - Configuration template

### ✅ Comprehensive Documentation
- `evolutionary-optimization/README.md` - Quick reference (277 lines)
- `evolutionary-optimization/FINAL-REPORT.md` - Complete analysis (272 lines)
- `evolutionary-optimization/BAKEOFF-COMPARISON.md` - Methodology comparison
- `tools/README.md` - Tool documentation (268 lines)

### ✅ Key Findings
- **Diminishing returns start at Round 11** (proven with data)
- **Top 5 mutations deliver 71-73%** of total improvement
- **More rounds ≠ better results** (logarithmic, not linear)
- **Optimal stopping point:** 15-20 rounds for maximum efficiency

---

## 📋 Implementation Plan

### Step 1: Create Genesis Module Structure

Create this directory structure in the Genesis repo:

```
genesis/
├── modules/
│   └── evolutionary-optimization/
│       ├── README.md (overview + quick start)
│       ├── core/
│       │   ├── evolutionary-optimizer.js (copy from product-requirements-assistant)
│       │   ├── base-scorer.js (abstract base class for scorers)
│       │   └── simulation-runner.js (copy from product-requirements-assistant)
│       ├── scorers/
│       │   ├── prd-scorer.js (copy from product-requirements-assistant)
│       │   ├── one-pager-scorer.js (NEW - create for one-pager projects)
│       │   ├── coe-scorer.js (NEW - create for COE generator)
│       │   └── README.md (scorer documentation)
│       ├── templates/
│       │   ├── test-cases.example.json (template for creating test cases)
│       │   ├── config.example.json (configuration template)
│       │   ├── mutations-library.md (proven mutations catalog)
│       │   └── project-types/ (project-specific templates)
│       │       ├── prd-assistant/
│       │       ├── one-pager/
│       │       └── coe-generator/
│       ├── scripts/
│       │   ├── run-simulation.js (copy from product-requirements-assistant)
│       │   ├── run-simulations.sh (copy from product-requirements-assistant)
│       │   ├── quick-start.sh (NEW - simplified entry point)
│       │   └── compare-projects.sh (NEW - cross-project comparison)
│       └── docs/
│           ├── GETTING-STARTED.md (step-by-step guide)
│           ├── MUTATION-GUIDE.md (how to create effective mutations)
│           ├── BEST-PRACTICES.md (lessons learned)
│           └── CROSS-PROJECT-COMPARISON.md (comparing quality across projects)
```

### Step 2: Copy Core Files from product-requirements-assistant

**⚠️ CRITICAL: COPY THESE FILES EXACTLY - DO NOT RECREATE OR MODIFY**

**Source Repository:** https://github.com/bordenet/product-requirements-assistant

**Before You Start:**
```bash
# Clone the reference implementation if you haven't already
cd /tmp
git clone https://github.com/bordenet/product-requirements-assistant.git
cd product-requirements-assistant

# Review each file BEFORE copying to understand what you're working with
```

**Files to Copy (Use Exactly As-Is):**

1. **Core Optimizer (526 lines - DO NOT RECREATE):**
   - Source: `tools/evolutionary-optimizer.js`
   - Destination: `modules/evolutionary-optimization/core/evolutionary-optimizer.js`
   - Status: ✅ Production-ready, battle-tested, no modifications needed
   - **Action:** `cp` this file EXACTLY as-is
   - **Review First:** `cat tools/evolutionary-optimizer.js` to see the implementation

2. **Simulation Runner (DO NOT RECREATE):**
   - Source: `tools/run-simulation.js`
   - Destination: `modules/evolutionary-optimization/scripts/run-simulation.js`
   - Status: ✅ Production-ready, no modifications needed
   - **Action:** `cp` this file EXACTLY as-is
   - **Review First:** `cat tools/run-simulation.js` to see the implementation

3. **Batch Simulation Script (236 lines - DO NOT RECREATE):**
   - Source: `tools/run-simulations.sh`
   - Destination: `modules/evolutionary-optimization/scripts/run-simulations.sh`
   - Status: ✅ Production-ready, follows shell script style guide
   - **Action:** `cp` this file EXACTLY as-is
   - **Review First:** `cat tools/run-simulations.sh` to see the implementation

4. **PRD Scorer (Template for Other Scorers - DO NOT RECREATE):**
   - Source: `tools/prd-scorer.js`
   - Destination: `modules/evolutionary-optimization/scorers/prd-scorer.js`
   - Status: ✅ Production-ready, use as template for one-pager-scorer.js and coe-scorer.js
   - **Action:** `cp` this file EXACTLY as-is, then ADAPT (don't rewrite) for other scorers
   - **Review First:** `cat tools/prd-scorer.js` to understand the scoring structure

5. **Test Cases Template (108 lines - DO NOT RECREATE):**
   - Source: `evolutionary-optimization/test-cases.json`
   - Destination: `modules/evolutionary-optimization/templates/test-cases.example.json`
   - Status: ✅ 8 diverse scenarios, proven effective
   - **Action:** `cp` this file EXACTLY as-is
   - **Review First:** `cat evolutionary-optimization/test-cases.json` to see the format

6. **Configuration Template (DO NOT RECREATE):**
   - Source: `evolutionary-optimization/config.example.json`
   - Destination: `modules/evolutionary-optimization/templates/config.example.json`
   - Status: ✅ Production-validated settings
   - **Action:** `cp` this file EXACTLY as-is
   - **Review First:** `cat evolutionary-optimization/config.example.json` to see the settings

7. **Documentation (268 lines - DO NOT RECREATE):**
   - Source: `tools/README.md`
   - Destination: `modules/evolutionary-optimization/docs/GETTING-STARTED.md`
   - Status: ✅ Comprehensive guide
   - **Action:** `cp` this file EXACTLY as-is
   - **Review First:** `cat tools/README.md` to understand the methodology

**Copy Commands:**
```bash
# From the product-requirements-assistant repo directory
cd /tmp/product-requirements-assistant

# Navigate to your Genesis repo
cd /path/to/genesis

# Create directory structure
mkdir -p modules/evolutionary-optimization/{core,scorers,templates,scripts,docs}

# Copy core files EXACTLY as-is
cp /tmp/product-requirements-assistant/tools/evolutionary-optimizer.js \
   modules/evolutionary-optimization/core/

cp /tmp/product-requirements-assistant/tools/run-simulation.js \
   modules/evolutionary-optimization/scripts/

cp /tmp/product-requirements-assistant/tools/run-simulations.sh \
   modules/evolutionary-optimization/scripts/

cp /tmp/product-requirements-assistant/tools/prd-scorer.js \
   modules/evolutionary-optimization/scorers/

cp /tmp/product-requirements-assistant/evolutionary-optimization/test-cases.json \
   modules/evolutionary-optimization/templates/test-cases.example.json

cp /tmp/product-requirements-assistant/evolutionary-optimization/config.example.json \
   modules/evolutionary-optimization/templates/

cp /tmp/product-requirements-assistant/tools/README.md \
   modules/evolutionary-optimization/docs/GETTING-STARTED.md

# Verify files were copied
ls -lh modules/evolutionary-optimization/core/
ls -lh modules/evolutionary-optimization/scripts/
ls -lh modules/evolutionary-optimization/scorers/
ls -lh modules/evolutionary-optimization/templates/
ls -lh modules/evolutionary-optimization/docs/
```

### Step 3: Create Project-Type-Specific Scorers

**⚠️ IMPORTANT: ADAPT, DON'T RECREATE**

You need to create scorers for each Genesis project type by **ADAPTING** the existing `prd-scorer.js`, not recreating from scratch.

**Process:**
1. ✅ **FIRST:** Review `prd-scorer.js` in the reference repo to understand the structure
2. ✅ **THEN:** Copy `prd-scorer.js` as a starting point for each new scorer
3. ✅ **FINALLY:** Modify ONLY the scoring criteria and logic, keep the structure

```bash
# Review the reference implementation FIRST
cat /tmp/product-requirements-assistant/tools/prd-scorer.js

# Study the structure:
# - How it exports the scorer
# - How it implements each scoring criterion
# - How it calculates the final score
# - How it handles edge cases
```

#### A. One-Pager Scorer (`scorers/one-pager-scorer.js`)

**Action:**
```bash
# Copy prd-scorer.js as starting point
cp modules/evolutionary-optimization/scorers/prd-scorer.js \
   modules/evolutionary-optimization/scorers/one-pager-scorer.js
```

**Then Adapt (Don't Rewrite) for One-Pager Scoring:**

**Scoring Criteria to Implement:**
1. **Clarity** (1-5): Problem statement is unambiguous and specific
2. **Conciseness** (1-5): Fits on one page, no fluff
3. **Actionability** (1-5): Clear next steps and success criteria
4. **Stakeholder Alignment** (1-5): Addresses all stakeholder concerns
5. **Business Impact** (1-5): Quantified value proposition

**What to Change:**
- Criterion names and weights
- Scoring logic for each criterion
- Document structure expectations

**What to Keep:**
- Overall class structure
- Export format
- Error handling
- Score calculation methodology

#### B. COE Scorer (`scorers/coe-scorer.js`)

**Action:**
```bash
# Copy prd-scorer.js as starting point
cp modules/evolutionary-optimization/scorers/prd-scorer.js \
   modules/evolutionary-optimization/scorers/coe-scorer.js
```

**Then Adapt (Don't Rewrite) for COE Scoring:**

**Scoring Criteria to Implement:**
1. **Comprehensiveness** (1-5): Covers all COE aspects (governance, standards, training)
2. **Clarity** (1-5): Roles and responsibilities unambiguous
3. **Practicality** (1-5): Implementable processes, not theoretical
4. **Measurability** (1-5): Clear KPIs and success metrics
5. **Scalability** (1-5): Works for current and future team sizes

**What to Change:**
- Criterion names and weights
- Scoring logic for each criterion
- Document structure expectations

**What to Keep:**
- Overall class structure
- Export format
- Error handling
- Score calculation methodology

**Reference the Code:**
When adapting scorers, constantly reference the original `prd-scorer.js` in:
https://github.com/bordenet/product-requirements-assistant/blob/main/tools/prd-scorer.js

### Step 4: Create Mutation Library

**⚠️ REFERENCE THE PROVEN MUTATIONS FROM THE REFERENCE REPO**

Before creating the mutation library, review the actual mutations that were proven effective:

```bash
# Review the optimization reports to see what mutations worked
cat /tmp/product-requirements-assistant/evolutionary-optimization/FINAL-REPORT.md
cat /tmp/product-requirements-assistant/evolutionary-optimization/README.md

# Look for the "Top 5 Mutations" section
# These are PROVEN with data, not theoretical
```

Create `templates/mutations-library.md` documenting proven mutations:

**Content to Include:**

```markdown
# Evolutionary Optimization Mutation Library

## High-Impact Mutations (Proven Across Projects)

### 1. Ban Vague Language (+6.0% average improvement)
**Target:** Clarity
**Applicable To:** All project types
**Implementation:**
- Add explicit banned words list: "improve", "enhance", "better", "optimize", "faster", "easier"
- Require alternatives: "increase from X to Y", "reduce from A to B"
- Force quantification with baseline + target + timeline

**Example:**
```
❌ FORBIDDEN: "Improve user experience"
✅ REQUIRED: "Reduce checkout time from 5 minutes to 2 minutes by Q2 2025"
```

### 2. Strengthen "No Implementation" Rule (+5.4% average improvement)
**Target:** Engineering-Ready (PRD), Actionability (One-Pager)
**Applicable To:** PRD, One-Pager, COE
**Implementation:**
- Add forbidden vs. allowed examples
- Show what NOT to include (React, PostgreSQL, OAuth, microservices)
- Show what TO include (business requirements, success criteria)

**Example:**
```
❌ FORBIDDEN: "Use React for the frontend and PostgreSQL for the database"
✅ REQUIRED: "Users must be able to view their data within 2 seconds of login"
```

### 3. Enhance Adversarial Tension (+2.9% average improvement)
**Target:** Consistency, Quality
**Applicable To:** Multi-phase workflows (PRD, One-Pager with review)
**Implementation:**
- Make review phase genuinely challenge, not just improve
- Require alternative perspectives
- Demand evidence for claims

### 4. Stakeholder Impact Requirements (+2.6% average improvement)
**Target:** Comprehensiveness
**Applicable To:** All project types
**Implementation:**
- Require quantified impact for each stakeholder group
- Force "why this matters" for each section
- Mandate business context

### 5. Quantified Success Metrics (+2.5% average improvement)
**Target:** Comprehensiveness, Measurability
**Applicable To:** All project types
**Implementation:**
- Require baseline + target + timeline + measurement method
- Eliminate vague success criteria
- Force specificity

## Medium-Impact Mutations

### 6. Business Context Requirement (+1.8% average improvement)
### 7. Synthesis Decision Criteria (+1.5% average improvement)
### 8. Out-of-Scope Examples (+1.2% average improvement)

## Low-Impact Mutations (Diminishing Returns)

### 9. Scope Boundary Examples (+0.0% - often discarded)
### 10. Edge Case Coverage (+0.01% average improvement)
### 11. Over-Specification Templates (+0.01% average improvement)

## Mutation Best Practices

1. **Target Weaknesses:** Identify lowest-scoring criteria in baseline
2. **Start with High-Impact:** Apply mutations 1-5 first
3. **One Change at a Time:** Don't combine mutations
4. **Objective Scoring:** Use keep/discard logic, not subjective judgment
5. **Stop at Diminishing Returns:** When improvements < 0.01 per round
```

### Step 5: Integrate with Genesis Spawn Scripts

Modify Genesis spawn scripts to include evolutionary optimization setup:

**File to Modify:** `genesis/spawn.sh` (or equivalent)

**Add After Project Creation:**

```bash
# Step X: Set up evolutionary optimization
echo "Setting up evolutionary optimization..."

# Create evolutionary-optimization directory
mkdir -p "$PROJECT_DIR/evolutionary-optimization"
mkdir -p "$PROJECT_DIR/tools"

# Copy core files from Genesis module
cp -r modules/evolutionary-optimization/core/* "$PROJECT_DIR/tools/"
cp -r modules/evolutionary-optimization/scripts/* "$PROJECT_DIR/tools/"

# Copy project-type-specific scorer
case "$PROJECT_TYPE" in
  "prd-assistant")
    cp modules/evolutionary-optimization/scorers/prd-scorer.js "$PROJECT_DIR/tools/"
    cp -r modules/evolutionary-optimization/templates/project-types/prd-assistant/* "$PROJECT_DIR/evolutionary-optimization/"
    ;;
  "one-pager")
    cp modules/evolutionary-optimization/scorers/one-pager-scorer.js "$PROJECT_DIR/tools/"
    cp -r modules/evolutionary-optimization/templates/project-types/one-pager/* "$PROJECT_DIR/evolutionary-optimization/"
    ;;
  "coe-generator")
    cp modules/evolutionary-optimization/scorers/coe-scorer.js "$PROJECT_DIR/tools/"
    cp -r modules/evolutionary-optimization/templates/project-types/coe-generator/* "$PROJECT_DIR/evolutionary-optimization/"
    ;;
esac

# Copy templates
cp modules/evolutionary-optimization/templates/test-cases.example.json "$PROJECT_DIR/evolutionary-optimization/"
cp modules/evolutionary-optimization/templates/config.example.json "$PROJECT_DIR/evolutionary-optimization/"
cp modules/evolutionary-optimization/templates/mutations-library.md "$PROJECT_DIR/evolutionary-optimization/"

# Copy documentation
mkdir -p "$PROJECT_DIR/docs/evolutionary-optimization"
cp modules/evolutionary-optimization/docs/* "$PROJECT_DIR/docs/evolutionary-optimization/"

# Create README
cat > "$PROJECT_DIR/evolutionary-optimization/README.md" << 'EOF'
# Evolutionary Prompt Optimization

This project includes out-of-the-box evolutionary optimization tooling.

## Quick Start

1. Review test cases: `evolutionary-optimization/test-cases.example.json`
2. Customize for your project
3. Run optimization: `./tools/run-simulations.sh`
4. Review results: `evolutionary-optimization/results/`

## Documentation

See `docs/evolutionary-optimization/GETTING-STARTED.md` for complete guide.

## Expected Results

- +20-30% quality improvement in 15-20 rounds
- Objective scoring with keep/discard logic
- Comprehensive optimization reports
- Proven mutation library

## Reference Implementation

This tooling is from: https://github.com/bordenet/product-requirements-assistant
EOF

echo "✅ Evolutionary optimization ready!"
```

### Step 6: Create Cross-Project Comparison Tool

Create `scripts/compare-projects.sh` to compare quality across Genesis projects:

```bash
#!/bin/bash

# Cross-Project Quality Comparison
# Compares evolutionary optimization results across Genesis-spawned projects

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}🔍 Cross-Project Quality Comparison${NC}\n"

# Find all Genesis projects with evolutionary optimization results
PROJECTS=()
for dir in ../*/evolutionary-optimization/results; do
  if [ -d "$dir" ]; then
    project_name=$(basename $(dirname $(dirname "$dir")))
    PROJECTS+=("$project_name")
  fi
done

if [ ${#PROJECTS[@]} -eq 0 ]; then
  echo "No projects with optimization results found."
  exit 0
fi

echo "Found ${#PROJECTS[@]} projects with optimization results:"
echo ""

# Create comparison table
printf "%-30s %-15s %-15s %-15s\n" "Project" "Baseline" "Optimized" "Improvement"
printf "%-30s %-15s %-15s %-15s\n" "$(printf '%.0s-' {1..30})" "$(printf '%.0s-' {1..15})" "$(printf '%.0s-' {1..15})" "$(printf '%.0s-' {1..15})"

for project in "${PROJECTS[@]}"; do
  results_file="../$project/evolutionary-optimization/results/optimization-report.md"

  if [ -f "$results_file" ]; then
    # Extract scores from report (this is a simplified example)
    baseline=$(grep -oP "Baseline.*\K[0-9.]+/5" "$results_file" | head -1 || echo "N/A")
    optimized=$(grep -oP "Final.*\K[0-9.]+/5" "$results_file" | head -1 || echo "N/A")
    improvement=$(grep -oP "Improvement.*\K[+\-][0-9.]+%" "$results_file" | head -1 || echo "N/A")

    printf "%-30s %-15s %-15s %-15s\n" "$project" "$baseline" "$optimized" "$improvement"
  fi
done

echo ""
echo -e "${GREEN}✅ Comparison complete${NC}"
```

### Step 7: Create Quick Start Script

Create `scripts/quick-start.sh` for simplified entry point:

```bash
#!/bin/bash

# Quick Start for Evolutionary Optimization
# Simplified entry point for new users

set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Evolutionary Optimization Quick Start${NC}\n"

# Step 1: Check if test cases exist
if [ ! -f "evolutionary-optimization/test-cases.json" ]; then
  echo -e "${YELLOW}⚠️  No test cases found. Creating from template...${NC}"
  cp evolutionary-optimization/test-cases.example.json evolutionary-optimization/test-cases.json
  echo "✅ Created test-cases.json"
  echo ""
  echo "📝 NEXT STEP: Edit evolutionary-optimization/test-cases.json with your project-specific test cases"
  echo ""
  exit 0
fi

# Step 2: Check if config exists
if [ ! -f "evolutionary-optimization/config.json" ]; then
  echo -e "${YELLOW}⚠️  No config found. Creating from template...${NC}"
  cp evolutionary-optimization/config.example.json evolutionary-optimization/config.json
  echo "✅ Created config.json"
fi

# Step 3: Run optimization
echo "Running 20-round optimization..."
echo ""
./tools/run-simulations.sh

echo ""
echo -e "${GREEN}✅ Optimization complete!${NC}"
echo ""
echo "Results: evolutionary-optimization/results/"
echo ""
```

### Step 8: Create Genesis Documentation

Create `modules/evolutionary-optimization/README.md`:

```markdown
# Evolutionary Prompt Optimization Module

**Status:** ✅ Production-validated
**Source:** https://github.com/bordenet/product-requirements-assistant
**Proven Results:** +20-30% quality improvements in 15-20 rounds

## Overview

This Genesis module provides out-of-the-box evolutionary prompt optimization for all spawned projects.

## What Gets Installed

When you spawn a new Genesis project, it automatically includes:

1. **Core Optimization Engine** (`tools/evolutionary-optimizer.js`)
   - Objective scoring with keep/discard logic
   - Multi-test-case validation
   - Diminishing returns analysis
   - Comprehensive reporting

2. **Project-Type-Specific Scorer** (`tools/*-scorer.js`)
   - PRD Scorer (for PRD assistant projects)
   - One-Pager Scorer (for one-pager projects)
   - COE Scorer (for COE generator projects)

3. **Simulation Tools** (`tools/run-simulation*.sh`)
   - 20-round simulation (optimal efficiency)
   - 40-round simulation (maximum quality)
   - Batch execution with progress tracking

4. **Templates and Examples**
   - Test cases template (8 diverse scenarios)
   - Configuration template (production-validated settings)
   - Mutation library (proven high-impact mutations)

5. **Complete Documentation**
   - Getting started guide
   - Mutation creation guide
   - Best practices
   - Cross-project comparison

## Quick Start (For Spawned Projects)

```bash
# 1. Customize test cases
vim evolutionary-optimization/test-cases.json

# 2. Run optimization
./tools/quick-start.sh

# 3. Review results
cat evolutionary-optimization/results/optimization-report.md
```

## Expected Results

- **Quality Improvement:** +20-30% in 15-20 rounds
- **Execution Time:** 30-60 minutes
- **Success Rate:** 70-95% mutations kept
- **Optimal Stopping Point:** Round 15-20 (diminishing returns after)

## Proven Mutations

Top 5 mutations (deliver 71-73% of total improvement):

1. **Ban Vague Language** (+6.0%)
2. **Strengthen "No Implementation" Rule** (+5.4%)
3. **Enhance Adversarial Tension** (+2.9%)
4. **Stakeholder Impact Requirements** (+2.6%)
5. **Quantified Success Metrics** (+2.5%)

See `templates/mutations-library.md` for complete catalog.

## Cross-Project Comparison

Compare quality across all Genesis projects:

```bash
cd genesis/modules/evolutionary-optimization
./scripts/compare-projects.sh
```

## Maintenance

This module is maintained in sync with product-requirements-assistant.

**Update Process:**
1. Pull latest from product-requirements-assistant
2. Copy updated files to `modules/evolutionary-optimization/`
3. Test with sample project
4. Update version in this README

**Current Version:** 1.0.0 (2025-11-21)

## Support

- **Reference Implementation:** https://github.com/bordenet/product-requirements-assistant
- **Documentation:** See `docs/` directory
- **Issues:** Report in Genesis repo
```

### Step 9: Update Genesis Main README

Add section to Genesis main README.md:

```markdown
## Evolutionary Prompt Optimization

All Genesis-spawned projects include out-of-the-box evolutionary optimization tooling.

**Features:**
- ✅ Objective scoring with keep/discard logic
- ✅ +20-30% quality improvements proven
- ✅ Project-type-specific scorers (PRD, One-Pager, COE)
- ✅ Proven mutation library
- ✅ Cross-project quality comparison

**Quick Start:**
```bash
# After spawning a project
cd my-new-project
./tools/quick-start.sh
```

**Reference Implementation:** https://github.com/bordenet/product-requirements-assistant

See `modules/evolutionary-optimization/README.md` for details.
```

### Step 10: Create Project-Type Templates

For each project type, create a template directory with pre-configured test cases and mutations.

#### A. PRD Assistant Template

Create `templates/project-types/prd-assistant/test-cases.json`:

```json
[
  {
    "id": "tc1-simple-feature",
    "title": "Simple Feature Addition",
    "type": "B2B SaaS",
    "complexity": "Simple",
    "problems": ["Problem 1", "Problem 2"],
    "context": "Context here"
  },
  {
    "id": "tc2-medium-complexity",
    "title": "Medium Complexity Feature",
    "type": "Mobile App",
    "complexity": "Medium",
    "problems": ["Problem 1", "Problem 2"],
    "context": "Context here"
  }
]
```

Create `templates/project-types/prd-assistant/config.json`:

```json
{
  "baselineDir": "prompts",
  "workingDir": "evolutionary-optimization/working",
  "resultsDir": "evolutionary-optimization/results",
  "testCasesFile": "evolutionary-optimization/test-cases.json",
  "maxRounds": 20,
  "minImprovement": 0.01,
  "scoringCriteria": [
    "comprehensiveness",
    "clarity",
    "structure",
    "consistency",
    "engineeringReady"
  ]
}
```

#### B. One-Pager Template

Create `templates/project-types/one-pager/test-cases.json`:

```json
[
  {
    "id": "tc1-simple-proposal",
    "title": "Simple Project Proposal",
    "type": "Internal Initiative",
    "complexity": "Simple",
    "problem": "Problem statement",
    "solution": "Proposed solution",
    "impact": "Expected impact"
  }
]
```

Create `templates/project-types/one-pager/config.json`:

```json
{
  "baselineDir": "prompts",
  "workingDir": "evolutionary-optimization/working",
  "resultsDir": "evolutionary-optimization/results",
  "testCasesFile": "evolutionary-optimization/test-cases.json",
  "maxRounds": 20,
  "minImprovement": 0.01,
  "scoringCriteria": [
    "clarity",
    "conciseness",
    "actionability",
    "stakeholderAlignment",
    "businessImpact"
  ]
}
```

#### C. COE Generator Template

Create `templates/project-types/coe-generator/test-cases.json`:

```json
[
  {
    "id": "tc1-engineering-coe",
    "title": "Engineering Center of Excellence",
    "type": "Technical COE",
    "complexity": "Medium",
    "scope": "Engineering practices, standards, training",
    "teamSize": "50-100 engineers",
    "goals": ["Standardization", "Quality", "Efficiency"]
  }
]
```

Create `templates/project-types/coe-generator/config.json`:

```json
{
  "baselineDir": "prompts",
  "workingDir": "evolutionary-optimization/working",
  "resultsDir": "evolutionary-optimization/results",
  "testCasesFile": "evolutionary-optimization/test-cases.json",
  "maxRounds": 20,
  "minImprovement": 0.01,
  "scoringCriteria": [
    "comprehensiveness",
    "clarity",
    "practicality",
    "measurability",
    "scalability"
  ]
}
```

---

## 🎯 Success Criteria

After implementation, verify:

### ✅ Module Structure
- [ ] `modules/evolutionary-optimization/` directory created
- [ ] All core files copied from product-requirements-assistant
- [ ] Project-type-specific scorers created (one-pager, COE)
- [ ] Mutation library documented
- [ ] Templates created for all project types

### ✅ Genesis Integration
- [ ] Spawn scripts modified to include optimization setup
- [ ] Cross-project comparison tool created
- [ ] Quick start script created
- [ ] Genesis README updated

### ✅ Documentation
- [ ] Module README created
- [ ] Getting started guide available
- [ ] Mutation guide available
- [ ] Best practices documented

### ✅ Testing
- [ ] Spawn a test PRD assistant project → verify optimization tools present
- [ ] Spawn a test one-pager project → verify optimization tools present
- [ ] Run quick-start.sh in test project → verify it works
- [ ] Run cross-project comparison → verify it works

### ✅ Quality Validation
- [ ] Run 20-round simulation on test project
- [ ] Verify +20-30% improvement achieved
- [ ] Verify optimization report generated
- [ ] Verify keep/discard logic working correctly

---

## 📊 Expected Outcomes

After completing this integration:

1. **All New Genesis Projects** will have evolutionary optimization out-of-the-box
2. **Consistent Quality Improvements** of +20-30% across all project types
3. **Cross-Project Comparisons** to identify best practices
4. **Proven Mutation Library** that grows with each project
5. **Reduced Manual Tuning** from 8+ hours to 30-60 minutes

---

## 🚀 Deployment Checklist

Before pushing to Genesis main:

- [ ] All files copied and created
- [ ] Spawn scripts tested with all project types
- [ ] Documentation complete and accurate
- [ ] Cross-project comparison tested
- [ ] Quick start script tested
- [ ] Linting passed (if applicable)
- [ ] No hardcoded paths (use relative paths)
- [ ] Shell scripts follow style guide (verbose flag, help, timer)

---

## 📝 Final Notes

### ⚠️ CRITICAL REMINDER: USE THE REFERENCE IMPLEMENTATION

**DO NOT GENERATE CODE FROM SCRATCH**

**Authoritative Source:** https://github.com/bordenet/product-requirements-assistant

**Before writing ANY code, you MUST:**
1. ✅ Clone the reference repo: `git clone https://github.com/bordenet/product-requirements-assistant.git`
2. ✅ Review the existing implementation: `cat tools/evolutionary-optimizer.js`
3. ✅ Copy the files EXACTLY as they are
4. ✅ Reference the code when you have questions

**This repo contains:**
- ✅ Production-validated tooling (526 lines of core optimizer) - **COPY THIS, don't recreate**
- ✅ Proven results (+31.1% improvement in 20 rounds) - **These are real results, not estimates**
- ✅ Complete documentation (277 lines README, 272 lines final report) - **COPY THIS**
- ✅ 8 diverse test cases - **COPY THIS**
- ✅ Comprehensive mutation library - **REFERENCE THIS**

**Key Files to Review Before Starting:**
```bash
# Clone and review FIRST
git clone https://github.com/bordenet/product-requirements-assistant.git
cd product-requirements-assistant

# Core optimizer (526 lines) - READ THIS FIRST
cat tools/evolutionary-optimizer.js

# Scorer implementation - READ THIS BEFORE creating new scorers
cat tools/prd-scorer.js

# Simulation runner - READ THIS FIRST
cat tools/run-simulation.js

# Shell script - READ THIS FIRST
cat tools/run-simulations.sh

# Test cases format - READ THIS FIRST
cat evolutionary-optimization/test-cases.json

# Configuration format - READ THIS FIRST
cat evolutionary-optimization/config.example.json

# Proven mutations - READ THIS BEFORE creating mutation library
cat evolutionary-optimization/README.md
cat evolutionary-optimization/FINAL-REPORT.md
```

**If you find yourself writing more than 50 lines of new code, STOP and ask:**
- "Should I be copying this from the reference repo instead?"
- "Am I recreating something that already exists?"
- "Have I reviewed the reference implementation?"

### Key Learnings to Preserve

1. **Diminishing Returns Start at Round 11** - Don't over-optimize
2. **Top 5 Mutations Deliver 71-73%** - Focus on high-impact changes
3. **More Rounds ≠ Better Results** - Logarithmic, not linear
4. **Objective Scoring is Critical** - No subjective judgment
5. **Diverse Test Cases Required** - Minimum 5-8 scenarios

### Maintenance Strategy

- **Quarterly Updates:** Pull latest from product-requirements-assistant
- **Version Tracking:** Document version in module README
- **Backward Compatibility:** Ensure existing projects still work
- **New Project Types:** Add scorers as Genesis expands

---

## ✅ Ready to Implement

You now have complete instructions to integrate evolutionary optimization into Genesis.

**Estimated Time:** 4-6 hours
**Expected ROI:** 8+ hours saved per project per optimization cycle
**Cross-Project Impact:** All Genesis projects benefit immediately

**Begin implementation and report back with:**
1. Module structure created (screenshot or tree output)
2. Test spawn results (PRD, one-pager, COE)
3. Sample optimization run results
4. Any issues or questions encountered

Good luck! 🚀


