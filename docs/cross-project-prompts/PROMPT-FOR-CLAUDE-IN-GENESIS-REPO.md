# Prompt for Claude Code in Genesis Repository

**Context:** You are Claude Code running in the Genesis repository workspace.

**Objective:** Integrate evolutionary prompt optimization machinery into Genesis so that ALL spawned projects can optimize their LLM prompts rigorously out of the box.

---

## 🎯 What You're Doing

The **product-requirements-assistant** repository has production-validated evolutionary optimization tooling. You will:

1. ✅ Create Genesis optimization module structure
2. ✅ Copy production-ready tooling from product-requirements-assistant
3. ✅ Create project-type-specific scorers (PRD, one-pager, COE, etc.)
4. ✅ Integrate with Genesis spawn scripts
5. ✅ Create cross-project quality comparison tools
6. ✅ Document mutation library and best practices

**Expected Results:**
- All Genesis-spawned projects get optimization tooling automatically
- +20-30% quality improvement out of the box
- 8+ hours saved per project per optimization cycle

---

## 📋 Step 1: Create Genesis Optimization Module Structure

```bash
# Ensure you're in Genesis repo
cd /path/to/genesis

# Create module structure
mkdir -p modules/evolutionary-optimization/{core,scorers,templates,scripts,docs}

# Create directory structure
cd modules/evolutionary-optimization
```

**Final Structure:**
```
genesis/
└── modules/
    └── evolutionary-optimization/
        ├── README.md
        ├── core/
        │   ├── evolutionary-optimizer.js
        │   └── base-scorer.js
        ├── scorers/
        │   ├── prd-scorer.js
        │   ├── one-pager-scorer.js
        │   ├── coe-scorer.js
        │   └── README.md
        ├── templates/
        │   ├── test-cases.example.json
        │   ├── config.example.json
        │   └── mutations-library.md
        ├── scripts/
        │   ├── run-simulation.js
        │   ├── run-simulations.sh
        │   ├── quick-start.sh
        │   └── compare-projects.sh
        └── docs/
            ├── GETTING-STARTED.md
            ├── MUTATION-GUIDE.md
            └── BEST-PRACTICES.md
```

---

## 📋 Step 2: Copy Core Files from product-requirements-assistant

```bash
# From Genesis repo root
cd modules/evolutionary-optimization

# Copy core optimizer (works out of the box)
cp ../../../product-requirements-assistant/tools/evolutionary-optimizer.js core/

# Copy simulation runner (works out of the box)
cp ../../../product-requirements-assistant/tools/run-simulation.js scripts/
cp ../../../product-requirements-assistant/tools/run-simulations.sh scripts/
cp ../../../product-requirements-assistant/tools/quick-start.sh scripts/

# Copy PRD scorer
cp ../../../product-requirements-assistant/tools/prd-scorer.js scorers/

# Copy configuration templates
cp ../../../product-requirements-assistant/evolutionary-optimization/config.example.json templates/
cp ../../../product-requirements-assistant/evolutionary-optimization/test-cases.json templates/test-cases-prd.example.json

# Copy documentation as template
cp ../../../product-requirements-assistant/tools/README.md docs/GETTING-STARTED.md

# Make scripts executable
chmod +x scripts/*.sh scripts/*.js
```

---

## 📋 Step 3: Create Base Scorer Class

Create `core/base-scorer.js`:

```javascript
/**
 * Base Scorer Class
 * Provides common scoring functionality for all project types
 */
class BaseScorer {
  constructor(criteria) {
    this.criteria = criteria;
  }

  /**
   * Score a single criterion
   */
  scoreCriterion(content, config) {
    let passed = 0;
    const total = config.checks.length;

    for (const check of config.checks) {
      if (check.scorer) {
        // Custom scoring function
        if (check.scorer(content)) passed++;
      } else if (check.pattern) {
        // Pattern-based scoring
        const matches = check.pattern.test(content);
        const shouldMatch = !check.inverse;
        if (matches === shouldMatch) passed++;
      }
    }

    // Convert to 1-5 scale
    return 1 + (passed / total) * 4;
  }

  /**
   * Score entire document
   */
  score(content) {
    const scores = {};
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const [criterion, config] of Object.entries(this.criteria)) {
      const score = this.scoreCriterion(content, config);
      scores[criterion] = score;
      totalWeightedScore += score * config.weight;
      totalWeight += config.weight;
    }

    scores.overall = totalWeightedScore / totalWeight;
    return scores;
  }

  /**
   * Get detailed breakdown
   */
  getBreakdown(content) {
    const breakdown = {};

    for (const [criterion, config] of Object.entries(this.criteria)) {
      breakdown[criterion] = {
        score: this.scoreCriterion(content, config),
        checks: []
      };

      for (const check of config.checks) {
        let passed = false;
        if (check.scorer) {
          passed = check.scorer(content);
        } else if (check.pattern) {
          const matches = check.pattern.test(content);
          passed = check.inverse ? !matches : matches;
        }

        breakdown[criterion].checks.push({
          name: check.name,
          passed
        });
      }
    }

    return breakdown;
  }
}

module.exports = BaseScorer;
```

---

## 📋 Step 4: Create Project-Type-Specific Scorers

### PRD Scorer (Already Copied)

`scorers/prd-scorer.js` - Use as-is from product-requirements-assistant

### One-Pager Scorer

Create `scorers/one-pager-scorer.js`:

```javascript
const BaseScorer = require('../core/base-scorer');

class OnePagerScorer extends BaseScorer {
  constructor() {
    const criteria = {
      clarity: {
        weight: 1.0,
        checks: [
          { name: 'No vague "improve"', pattern: /\bimprove\b(?!\s+from)/i, inverse: true },
          { name: 'No vague "enhance"', pattern: /\benhance\b(?!\s+from)/i, inverse: true },
          { name: 'No vague "better"', pattern: /\bbetter\b/i, inverse: true },
          { name: 'Has specific metrics', pattern: /baseline|target|from \d+ to \d+/i },
          { name: 'Has quantified goals', pattern: /\d+%|\d+x|<\d+/i },
          { name: 'Executive summary present', pattern: /## Executive Summary|## Summary/i }
        ]
      },
      conciseness: {
        weight: 1.0,
        checks: [
          { name: 'Fits on one page', scorer: (content) => content.split('\n').length <= 100 },
          { name: 'No fluff', pattern: /\b(obviously|clearly|simply|just|basically)\b/i, inverse: true },
          { name: 'Bullet points used', pattern: /^[\s]*[-*]\s/m },
          { name: 'Short paragraphs', scorer: (content) => {
            const paragraphs = content.split('\n\n');
            const longParagraphs = paragraphs.filter(p => p.split(' ').length > 100);
            return longParagraphs.length === 0;
          }}
        ]
      },
      actionability: {
        weight: 1.0,
        checks: [
          { name: 'Clear next steps', pattern: /## Next Steps|## Action Items|## Recommendations/i },
          { name: 'Decision points identified', pattern: /Decision:|Decide:|Choose:/i },
          { name: 'Timeline specified', pattern: /\d+ (weeks?|months?|quarters?)/i },
          { name: 'Owners assigned', pattern: /Owner:|Responsible:|DRI:/i }
        ]
      }
    };

    super(criteria);
  }
}

module.exports = OnePagerScorer;
```

### COE Scorer

Create `scorers/coe-scorer.js`:

```javascript
const BaseScorer = require('../core/base-scorer');

class COEScorer extends BaseScorer {
  constructor() {
    const criteria = {
      technicalAccuracy: {
        weight: 1.0,
        checks: [
          { name: 'No vague "improve"', pattern: /\bimprove\b(?!\s+from)/i, inverse: true },
          { name: 'Has specific metrics', pattern: /baseline|target|from \d+ to \d+/i },
          { name: 'Technical terms defined', pattern: /\*\*.*\*\*:|Definition:/i },
          { name: 'References cited', pattern: /\[.*\]\(.*\)|Reference:|Source:/i }
        ]
      },
      comprehensiveness: {
        weight: 1.0,
        checks: [
          { name: 'Best practices section', pattern: /## Best Practices|## Guidelines/i },
          { name: 'Examples provided', pattern: /## Example|### Example|```/i },
          { name: 'Anti-patterns covered', pattern: /## Anti-Patterns|## Common Mistakes|## Pitfalls/i },
          { name: 'Tools mentioned', pattern: /## Tools|## Resources/i }
        ]
      },
      actionability: {
        weight: 1.0,
        checks: [
          { name: 'Step-by-step guidance', pattern: /## Step \d+|### Step \d+|\d+\./i },
          { name: 'Decision framework', pattern: /## When to|## How to Choose/i },
          { name: 'Checklists provided', pattern: /- \[ \]|- \[x\]/i }
        ]
      }
    };

    super(criteria);
  }
}

module.exports = COEScorer;
```

### Scorer README

Create `scorers/README.md`:

```markdown
# Project-Type-Specific Scorers

## Available Scorers

### PRD Scorer (`prd-scorer.js`)
For Product Requirements Documents

**Criteria:**
- Comprehensiveness (20%)
- Clarity (20%)
- Structure (20%)
- Consistency (20%)
- Engineering-Ready (20%)

### One-Pager Scorer (`one-pager-scorer.js`)
For Executive One-Pagers

**Criteria:**
- Clarity (33%)
- Conciseness (33%)
- Actionability (33%)

### COE Scorer (`coe-scorer.js`)
For Center of Excellence Documents

**Criteria:**
- Technical Accuracy (33%)
- Comprehensiveness (33%)
- Actionability (33%)

## Creating New Scorers

1. Extend `BaseScorer` from `../core/base-scorer.js`
2. Define criteria with checks (pattern-based or custom functions)
3. Export the scorer class
4. Update Genesis spawn scripts to use the new scorer
```

---

## 📋 Step 5: Integrate with Genesis Spawn Scripts

Update `genesis/spawn.sh` (or equivalent spawn script):

```bash
# Add after project creation

echo "📊 Setting up evolutionary optimization..."

# Copy core tooling
mkdir -p "$PROJECT_DIR/tools"
cp -r modules/evolutionary-optimization/core/* "$PROJECT_DIR/tools/"
cp -r modules/evolutionary-optimization/scripts/* "$PROJECT_DIR/tools/"

# Copy appropriate scorer based on project type
case "$PROJECT_TYPE" in
  "prd-assistant")
    echo "  ✅ Installing PRD scorer..."
    cp modules/evolutionary-optimization/scorers/prd-scorer.js "$PROJECT_DIR/tools/"
    ;;
  "one-pager")
    echo "  ✅ Installing one-pager scorer..."
    cp modules/evolutionary-optimization/scorers/one-pager-scorer.js "$PROJECT_DIR/tools/"
    ;;
  "coe-generator")
    echo "  ✅ Installing COE scorer..."
    cp modules/evolutionary-optimization/scorers/coe-scorer.js "$PROJECT_DIR/tools/"
    ;;
  *)
    echo "  ⚠️  No specific scorer for project type '$PROJECT_TYPE', using PRD scorer as default"
    cp modules/evolutionary-optimization/scorers/prd-scorer.js "$PROJECT_DIR/tools/"
    ;;
esac

# Copy templates
mkdir -p "$PROJECT_DIR/evolutionary-optimization"
cp modules/evolutionary-optimization/templates/config.example.json "$PROJECT_DIR/evolutionary-optimization/"
cp modules/evolutionary-optimization/templates/test-cases-${PROJECT_TYPE}.example.json "$PROJECT_DIR/evolutionary-optimization/test-cases.json" 2>/dev/null || \
  cp modules/evolutionary-optimization/templates/test-cases.example.json "$PROJECT_DIR/evolutionary-optimization/test-cases.json"

# Make scripts executable
chmod +x "$PROJECT_DIR/tools"/*.sh "$PROJECT_DIR/tools"/*.js

echo "✅ Evolutionary optimization tooling installed"
echo ""
echo "📖 Quick Start:"
echo "   cd $PROJECT_DIR"
echo "   ./tools/quick-start.sh"
echo ""
```

---

## 📋 Step 6: Create Cross-Project Comparison Tool

Create `scripts/compare-projects.sh`:

```bash
#!/bin/bash
# Compare optimization results across all Genesis-spawned projects

set -euo pipefail

echo "🔍 Comparing Optimization Results Across Genesis Projects"
echo ""

# Find all Genesis-spawned projects (adjust path as needed)
GENESIS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PROJECTS_DIR="$GENESIS_ROOT/../"

echo "| Project | Baseline | Current | Improvement | Rounds |"
echo "|---------|----------|---------|-------------|--------|"

# Look for projects with optimization results
for project_dir in "$PROJECTS_DIR"/*; do
  if [ -d "$project_dir" ] && [ -f "$project_dir/evolutionary-optimization/results-20round/optimization-report.md" ]; then
    project_name=$(basename "$project_dir")
    report="$project_dir/evolutionary-optimization/results-20round/optimization-report.md"

    baseline=$(grep "Baseline Score" "$report" | awk '{print $4}' || echo "N/A")
    final=$(grep "Final Score" "$report" | awk '{print $4}' || echo "N/A")
    improvement=$(grep "Improvement" "$report" | awk '{print $4}' || echo "N/A")
    rounds=$(grep "Rounds Completed" "$report" | awk '{print $4}' || echo "N/A")

    echo "| $project_name | $baseline | $final | $improvement | $rounds |"
  fi
done

echo ""
echo "✅ Comparison complete"
echo ""
echo "💡 To optimize a project:"
echo "   cd <project-directory>"
echo "   ./tools/quick-start.sh"
```

Make it executable:
```bash
chmod +x scripts/compare-projects.sh
```

---

## 📋 Step 7: Create Mutation Library Documentation

Create `templates/mutations-library.md`:

```markdown
# Mutation Library for Genesis Projects

## Top 5 High-Impact Mutations (71-73% of improvement)

### 1. Ban Vague Language (+6.0%)
**Target:** Clarity
**Applies to:** All project types
**Implementation:** Add banned words list to prompts

**Pattern:**
```markdown
## ⚠️ CRITICAL: Banned Vague Language

❌ NEVER use: "improve", "enhance", "better", "optimize", "faster", "easier"
✅ ALWAYS use: Baseline + Target (e.g., "reduce from 5 hours to 30 minutes")
```

### 2. Strengthen No Implementation Rule (+5.4%)
**Target:** Engineering-Ready
**Applies to:** PRD, Technical Specs
**Implementation:** Add forbidden implementation details list

**Pattern:**
```markdown
## ⚠️ CRITICAL: Focus on "Why" and "What", NOT "How"

❌ FORBIDDEN: "Use microservices", "Implement OAuth", "Store in PostgreSQL"
✅ ALLOWED: "Users must authenticate securely", "System must handle 10K users"
```

### 3. Enhance Adversarial Tension (+2.9%)
**Target:** Consistency
**Applies to:** Multi-phase workflows
**Implementation:** Add adversarial review mandate to Phase 2

**Pattern:**
```markdown
## ⚠️ CRITICAL: Your Role is to CHALLENGE, Not Just Improve

Your Mandate:
1. Question Assumptions
2. Offer Alternatives
3. Challenge Scope
4. Reframe Problems
5. Push Back
```

### 4. Add Stakeholder Impact Requirements (+2.6%)
**Target:** Comprehensiveness
**Applies to:** All project types
**Implementation:** Add stakeholder template to prompts

**Pattern:**
```markdown
For EACH stakeholder:
- Role: What they do
- Impact: How this affects them (quantified)
- Needs: What they need
- Success Criteria: How they measure success
```

### 5. Require Quantified Success Metrics (+2.5%)
**Target:** Comprehensiveness
**Applies to:** All project types
**Implementation:** Add metrics template to prompts

**Pattern:**
```markdown
For EACH metric:
- Metric Name
- Baseline (with evidence)
- Target (specific number)
- Timeline
- Measurement Method
```

## Usage Guidelines

1. **Start with Top 5** - Apply mutations 1-5 first (70%+ of improvement)
2. **Run Simulation** - Validate with 20-round simulation
3. **Stop at 20 Rounds** - Diminishing returns after Round 11

## Project-Type-Specific Recommendations

### PRD Projects
Focus on: Mutations 1, 2, 4, 5

### One-Pager Projects
Focus on: Mutations 1, 4, 5

### COE Projects
Focus on: Mutations 1, 4, 5
```

---

## 📋 Step 8: Update Genesis Documentation

Update `genesis/README.md`:

```markdown
## Evolutionary Optimization

All Genesis-spawned projects include evolutionary prompt optimization tooling.

**Quick Start:**
```bash
cd your-project
./tools/quick-start.sh
```

**Features:**
- ✅ Objective scoring system
- ✅ 20-round and 40-round simulations
- ✅ Project-type-specific scorers
- ✅ Mutation library with proven patterns
- ✅ Cross-project quality comparison

**Expected Results:**
- +20-30% quality improvement in 20 rounds
- Top 5 mutations deliver 70%+ of improvement
- Optimal stopping point: 15-20 rounds

**Documentation:**
- `modules/evolutionary-optimization/docs/GETTING-STARTED.md`
- `modules/evolutionary-optimization/templates/mutations-library.md`
```

---

## ✅ Success Criteria

- [ ] Genesis optimization module created
- [ ] Core files copied from product-requirements-assistant
- [ ] Base scorer class created
- [ ] Project-type-specific scorers created (PRD, one-pager, COE)
- [ ] Spawn scripts updated to include optimization tooling
- [ ] Cross-project comparison tool created
- [ ] Mutation library documented
- [ ] Genesis documentation updated
- [ ] All tests passing, linting clean
- [ ] Changes committed and pushed

---

## 📚 Reference

**Authoritative Source:** https://github.com/bordenet/product-requirements-assistant

**Key Files:**
- `tools/evolutionary-optimizer.js`
- `tools/prd-scorer.js`
- `docs/continuous-improvement/SIMULATION-RESULTS-SUMMARY.md`

---

**Expected Outcome:** All Genesis-spawned projects get +20-30% quality improvement out of the box with 8+ hours saved per optimization cycle.

**Status:** Ready to execute
**Version:** 1.0 (Production-validated)
