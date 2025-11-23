# Prompt for Claude Code in One-Pager Repository

**Context:** You are Claude Code running in the one-pager repository workspace.

**Objective:** Upgrade the one-pager project with evolutionary prompt optimization tooling from product-requirements-assistant, achieving +20-30% quality improvement.

---

## 🎯 What You're Doing

The **product-requirements-assistant** repository has completed production-validated evolutionary prompt optimization. You will:

1. ✅ Copy production-ready tooling from product-requirements-assistant
2. ✅ Adapt the PRD scorer for one-pager format
3. ✅ Apply Top 5 mutations to one-pager prompts
4. ✅ Run 20-round simulation to validate improvements
5. ✅ Deploy winning mutations to production

**Expected Results:**
- +20-30% quality improvement in one-pager outputs
- Reusable optimization tooling for future iterations
- Objective scoring system for measuring quality

---

## 📋 Step 1: Copy Tooling from product-requirements-assistant

```bash
# Ensure you're in one-pager repo
cd /path/to/one-pager

# Create tools directory if it doesn't exist
mkdir -p tools

# Copy core optimizer (works out of the box)
cp ../product-requirements-assistant/tools/evolutionary-optimizer.js tools/

# Copy simulation runner (works out of the box)
cp ../product-requirements-assistant/tools/run-simulation.js tools/
cp ../product-requirements-assistant/tools/run-simulations.sh tools/
cp ../product-requirements-assistant/tools/quick-start.sh tools/

# Copy PRD scorer as template (will adapt for one-pager)
cp ../product-requirements-assistant/tools/prd-scorer.js tools/one-pager-scorer.js

# Copy documentation
cp ../product-requirements-assistant/tools/README.md tools/

# Make scripts executable
chmod +x tools/run-simulations.sh tools/quick-start.sh tools/run-simulation.js

# Create evolutionary-optimization directory
mkdir -p evolutionary-optimization

# Copy configuration templates
cp ../product-requirements-assistant/evolutionary-optimization/config.example.json evolutionary-optimization/
cp ../product-requirements-assistant/evolutionary-optimization/test-cases.json evolutionary-optimization/test-cases-template.json
```

---

## 📋 Step 2: Adapt Scorer for One-Pager Format

Edit `tools/one-pager-scorer.js` to score one-pager documents instead of PRDs.

**Key Changes:**

1. **Rename class:** `PRDScorer` → `OnePagerScorer`

2. **Update scoring criteria:**

```javascript
this.criteria = {
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
  },
  stakeholderFocus: {
    weight: 1.0,
    checks: [
      { name: 'Executive concerns addressed', pattern: /ROI|revenue|cost|risk|competitive/i },
      { name: 'Business impact quantified', pattern: /\$\d+|revenue|profit|savings/i },
      { name: 'Strategic alignment', pattern: /strategy|vision|mission|goals/i },
      { name: 'Risk assessment', pattern: /## Risks|## Challenges|## Concerns/i }
    ]
  },
  dataDriven: {
    weight: 1.0,
    checks: [
      { name: 'Baseline metrics', pattern: /baseline|current state|today/i },
      { name: 'Target metrics', pattern: /target|goal|objective/i },
      { name: 'Evidence cited', pattern: /measured|tracked|data shows|analysis indicates/i },
      { name: 'Quantified impacts', pattern: /\d+%|\d+x|from \d+ to \d+/i }
    ]
  }
};
```

3. **Update module export:**
```javascript
module.exports = OnePagerScorer;
```

---

## 📋 Step 3: Create One-Pager Test Cases

Create `evolutionary-optimization/test-cases.json` with 8 diverse one-pager scenarios:

```json
[
  {
    "id": "test-1",
    "title": "Executive Decision: Build vs Buy CRM",
    "problems": ["Current CRM costs $500K/year with limited customization", "Sales team productivity down 20% due to tool limitations"],
    "context": "Enterprise SaaS company, 500 employees, $50M ARR"
  },
  {
    "id": "test-2",
    "title": "Strategic Initiative: Enter European Market",
    "problems": ["Revenue growth slowing in US market (5% YoY vs 30% historical)", "Top 3 competitors already established in EU"],
    "context": "B2B SaaS, $50M ARR, 200 enterprise customers"
  },
  {
    "id": "test-3",
    "title": "Product Decision: Add Mobile App",
    "problems": ["60% of users request mobile access", "Losing deals to mobile-first competitors"],
    "context": "Web-based project management tool, 10K users"
  },
  {
    "id": "test-4",
    "title": "Operational Decision: Migrate to Cloud",
    "problems": ["On-prem infrastructure costs $2M/year", "Deployment cycles take 6 weeks vs industry standard 1 week"],
    "context": "Legacy enterprise software company, 100 customers"
  },
  {
    "id": "test-5",
    "title": "Investment Decision: Acquire Competitor",
    "problems": ["Market consolidation accelerating", "Competitor has 30% market share in target segment"],
    "context": "Series C startup, $100M funding, 50 employees"
  },
  {
    "id": "test-6",
    "title": "Strategic Decision: Pivot to Enterprise",
    "problems": ["SMB churn rate 40% annually", "Enterprise deals 10x larger ACV"],
    "context": "B2B SaaS, $10M ARR, 1000 SMB customers"
  },
  {
    "id": "test-7",
    "title": "Product Decision: Sunset Legacy Feature",
    "problems": ["Feature used by <5% of users", "Maintenance costs $500K/year"],
    "context": "Mature SaaS product, 50K users, 10-year-old codebase"
  },
  {
    "id": "test-8",
    "title": "Organizational Decision: Restructure Engineering",
    "problems": ["Deployment frequency down 50% YoY", "Engineer satisfaction score 3.2/5"],
    "context": "Tech company, 200 engineers, monolithic architecture"
  }
]
```

---

## 📋 Step 4: Apply Top 5 Mutations to One-Pager Prompts

Locate your main one-pager prompt file (likely in `prompts/` directory) and apply these mutations:

### Mutation 1: Ban Vague Language (+6.0%)

Add this section near the top of your prompt:

```markdown
## ⚠️ CRITICAL: Banned Vague Language

❌ **NEVER use these vague terms without specific quantification:**
- "improve" → Specify: "increase from X to Y"
- "enhance" → Specify: "reduce from X to Y"
- "user-friendly" → Specify: "reduce clicks from X to Y"
- "efficient" → Specify: "process N items in <X seconds"
- "scalable" → Specify: "handle N concurrent users"
- "better" → Specify: exact metric and target
- "optimize" → Specify: what metric improves by how much
- "faster" → Specify: "reduce from X seconds to Y seconds"
- "easier" → Specify: "reduce steps from X to Y"

✅ **ALWAYS use:**
- Baseline + Target: "reduce from 5 hours/week to 30 minutes/week"
- Quantified outcomes: "increase NPS from 42 to 48"
- Measurable criteria: "process 100K transactions/day"
```

### Mutation 2: Focus on "Why" and "What", NOT "How"

Add this section:

```markdown
## ⚠️ CRITICAL: Focus on "Why" and "What", NOT "How"

❌ **FORBIDDEN (Implementation Details):**
- "Use microservices architecture"
- "Implement OAuth 2.0"
- "Store data in PostgreSQL"
- "Build a React dashboard"
- "Use machine learning model"

✅ **ALLOWED (Business Requirements):**
- "Users must authenticate securely"
- "System must handle 10K concurrent users"
- "Data must be accessible within 2 seconds"
- "System must detect fraud with <5% false positive rate"

**Rule:** If an engineer could implement it multiple ways, you're describing WHAT.
If you're prescribing a specific technology, you're describing HOW (forbidden).
```

### Mutation 3: Require Quantified Success Metrics

Add this section:

```markdown
## ⚠️ CRITICAL: Quantified Success Metrics

For EACH metric, provide:
- **Metric Name:** What we're measuring
- **Baseline:** Current state (with evidence/source)
- **Target:** Goal state (specific number)
- **Timeline:** When we'll achieve it
- **Measurement Method:** How we'll track it

Example:
- **Metric:** Customer acquisition cost
- **Baseline:** $5,000 per customer (Q4 2024 data)
- **Target:** $3,000 per customer
- **Timeline:** 6 months post-launch
- **Measurement:** Monthly CAC tracking via Salesforce
```

### Mutation 4: Stakeholder Impact Requirements

Add this section:

```markdown
## ⚠️ CRITICAL: Stakeholder Impact

For EACH stakeholder group, specify:
- **Role:** What they do
- **Impact:** How this affects them (quantified)
- **Needs:** What they need from this decision
- **Success Criteria:** How they'll measure success

Example:
### Sales Team
- **Role:** Acquire new customers
- **Impact:** Deal cycle reduced from 90 days to 45 days (50% reduction)
- **Needs:** Training on new value proposition, updated sales collateral
- **Success Criteria:** Close rate >25%, quota attainment >80%
```

### Mutation 5: Enhance Adversarial Tension (if using multi-phase workflow)

If one-pager uses a review phase, add this to the reviewer prompt:

```markdown
## ⚠️ CRITICAL: Your Role is to CHALLENGE, Not Just Improve

You are NOT a copy editor. You are a reviewer with a DIFFERENT perspective.

**Your Mandate:**
1. **Question Assumptions** - If Phase 1 assumes X, ask "What if NOT X?"
2. **Offer Alternatives** - Propose genuinely different approaches
3. **Challenge Scope** - Is this too big? Too small? Wrong focus?
4. **Reframe Problems** - Can this be stated differently?
5. **Push Back** - If something doesn't make sense, say so

**Goal:** Create productive tension that forces better decisions.
```

---

## 📋 Step 5: Update evolutionary-optimizer.js for One-Pager

Edit `tools/evolutionary-optimizer.js` to use `OnePagerScorer` instead of `PRDScorer`:

```javascript
// Change this line:
const PRDScorer = require('./prd-scorer');

// To this:
const OnePagerScorer = require('./one-pager-scorer');

// And update the scorer instantiation:
const scorer = new OnePagerScorer();
```

Also update the `simulatePRDGeneration` method name to `simulateOnePagerGeneration` and adjust the simulation logic for one-pager format (executive summary, decision framework, etc.).

---

## 📋 Step 6: Run 20-Round Simulation

```bash
cd one-pager
./tools/run-simulations.sh
```

**Expected Output:**
- Baseline: ~3.5/5.0
- After 20 rounds: ~4.2-4.5/5.0 (+20-30% improvement)
- Top 5 mutations deliver 70%+ of improvement

---

## 📋 Step 7: Review Results and Apply to Production

1. **Review simulation report:**
   ```bash
   cat evolutionary-optimization/results-20round/optimization-report.md
   ```

2. **Identify top mutations** (should be the 5 we applied)

3. **Verify mutations are in production prompts** (already done in Step 4)

4. **Run linting and tests:**
   ```bash
   npm run lint
   npm test
   ```

5. **Commit changes:**
   ```bash
   git add -A
   git commit -m "feat: Apply evolutionary optimization from product-requirements-assistant

   - Applied Top 5 mutations to one-pager prompts
   - Added evolutionary optimization tooling
   - Validated with 20-round simulation (+20-30% improvement)
   - All tests passing, linting clean"

   git push origin main
   ```

---

## ✅ Success Criteria

- [ ] Tooling copied from product-requirements-assistant
- [ ] One-pager scorer created with appropriate criteria
- [ ] Top 5 mutations applied to prompts
- [ ] Test cases created (8 diverse scenarios)
- [ ] 20-round simulation executed successfully
- [ ] Results show +20-30% improvement
- [ ] All tests passing, linting clean
- [ ] Changes committed and pushed

---

## 📚 Reference

**Authoritative Source:** https://github.com/bordenet/product-requirements-assistant

**Key Files:**
- `tools/evolutionary-optimizer.js` - Core optimizer
- `tools/prd-scorer.js` - Template for one-pager-scorer.js
- `prompts/phase1-claude-initial.md` - Example of mutations applied
- `docs/continuous-improvement/SIMULATION-RESULTS-SUMMARY.md` - Complete analysis

---

**Expected Outcome:** +20-30% quality improvement in one-pager outputs with reusable optimization tooling.

**Status:** Ready to execute
**Version:** 1.0 (Production-validated)
