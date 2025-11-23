#!/bin/bash

# Evolutionary Optimization Quick Start
# Sets up and runs a basic evolutionary optimization cycle

set -e

VERBOSE=false
SHOW_HELP=false

# Color codes
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    -h|--help)
      SHOW_HELP=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      SHOW_HELP=true
      shift
      ;;
  esac
done

# Help documentation
if [ "$SHOW_HELP" = true ]; then
  cat << 'EOF'
NAME
    quick-start.sh - Set up and run evolutionary prompt optimization

SYNOPSIS
    ./tools/quick-start.sh [OPTIONS]

DESCRIPTION
    Sets up the evolutionary optimization environment and runs a basic
    optimization cycle with 5 proven mutations.

OPTIONS
    -v, --verbose
        Enable verbose output showing detailed progress

    -h, --help
        Display this help message and exit

EXAMPLES
    # Run with default settings (minimal output)
    ./tools/quick-start.sh

    # Run with verbose output
    ./tools/quick-start.sh --verbose

    # View help
    ./tools/quick-start.sh --help

WORKFLOW
    1. Creates working directory structure
    2. Copies baseline prompts to working directory
    3. Copies example config to active config
    4. Runs evolutionary optimizer with 5 proven mutations
    5. Generates optimization report

OUTPUT
    Results saved to:
    - evolutionary-optimization/results/optimization-report.md
    - evolutionary-optimization/results/state.json
    - evolutionary-optimization/working/*.md (optimized prompts)

SEE ALSO
    tools/README.md - Complete documentation
    tools/evolutionary-optimizer.js - Main optimizer
    tools/prd-scorer.js - Scoring engine

EOF
  exit 0
fi

# Timer in top right corner
start_time=$(date +%s)
show_timer() {
  if [ "$VERBOSE" = false ]; then
    elapsed=$(($(date +%s) - start_time))
    mins=$((elapsed / 60))
    secs=$((elapsed % 60))
    # Move cursor to top right, show timer in yellow on black
    tput sc # Save cursor position
    tput cup 0 $(($(tput cols) - 15))
    echo -ne "${YELLOW}\033[40m ⏱  ${mins}m ${secs}s ${NC}"
    tput rc # Restore cursor position
  fi
}

trap show_timer EXIT

log() {
  if [ "$VERBOSE" = true ]; then
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
  fi
}

success() {
  echo -e "${GREEN}✅${NC} $1"
}

error() {
  echo -e "${RED}❌${NC} $1"
  exit 1
}

# Main execution
echo -e "${GREEN}🚀 Evolutionary Optimization Quick Start${NC}\n"

# Step 1: Create directories
log "Creating directory structure..."
mkdir -p evolutionary-optimization/working
mkdir -p evolutionary-optimization/results
success "Directories created"

# Step 2: Copy baseline prompts
log "Copying baseline prompts to working directory..."
if [ ! -d "prompts" ]; then
  error "prompts/ directory not found. Run from project root."
fi

cp prompts/*.md evolutionary-optimization/working/ 2>/dev/null || true
success "Baseline prompts copied"

# Step 3: Set up config
log "Setting up configuration..."
if [ ! -f "evolutionary-optimization/config.json" ]; then
  if [ -f "evolutionary-optimization/config.example.json" ]; then
    cp evolutionary-optimization/config.example.json evolutionary-optimization/config.json
    success "Config created from example"
  else
    error "config.example.json not found"
  fi
else
  success "Config already exists"
fi

# Step 4: Verify test cases
log "Verifying test cases..."
if [ ! -f "evolutionary-optimization/test-cases.json" ]; then
  error "test-cases.json not found. Please create it first."
fi
success "Test cases found"

# Step 5: Run optimizer
echo ""
echo -e "${BLUE}📊 Running evolutionary optimizer...${NC}"
echo ""

if [ "$VERBOSE" = true ]; then
  node tools/evolutionary-optimizer.js evolutionary-optimization/config.json
else
  node tools/evolutionary-optimizer.js evolutionary-optimization/config.json 2>&1 | grep -E "^(🚀|✅|❌|📊|🧬|⚠️|📄)"
fi

# Step 6: Summary
echo ""
echo -e "${GREEN}✅ Optimization complete!${NC}"
echo ""
echo "Results:"
echo "  📄 Report: evolutionary-optimization/results/optimization-report.md"
echo "  💾 State:  evolutionary-optimization/results/state.json"
echo "  📝 Prompts: evolutionary-optimization/working/*.md"
echo ""
echo "Next steps:"
echo "  1. Review optimization-report.md"
echo "  2. Compare working/*.md with prompts/*.md"
echo "  3. Deploy winners: cp evolutionary-optimization/working/*.md prompts/"
echo ""

show_timer
