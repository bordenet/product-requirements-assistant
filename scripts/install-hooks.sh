#!/usr/bin/env bash

################################################################################
# Product Requirements Assistant - Install Git Hooks
################################################################################
# PURPOSE: Install pre-commit hooks for quality gates
#   - Checks for compiled binaries
#   - Checks for secrets in source code
#   - Runs quick validation
#
# USAGE:
#   ./scripts/install-hooks.sh
#
# DEPENDENCIES:
#   - git
################################################################################

# Source common library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"
init_script

readonly REPO_ROOT="$(get_repo_root)"
readonly HOOKS_DIR="$REPO_ROOT/.git/hooks"

main() {
    log_header "Installing Git Hooks"

    # Check if .git directory exists
    if [[ ! -d "$REPO_ROOT/.git" ]]; then
        die "Not a git repository. Run: git init"
    fi

    # Create hooks directory if it doesn't exist
    mkdir -p "$HOOKS_DIR"

    # Create pre-commit hook
    log_section "Creating pre-commit hook"
    
    cat > "$HOOKS_DIR/pre-commit" << 'EOF'
#!/usr/bin/env bash
################################################################################
# Pre-Commit Hook - Quality Gate
################################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Pre-Commit Quality Gate"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for binaries
if [[ -f "$SCRIPT_DIR/scripts/check-binaries.sh" ]]; then
    "$SCRIPT_DIR/scripts/check-binaries.sh"
fi

# Check for secrets
if [[ -f "$SCRIPT_DIR/scripts/check-secrets.sh" ]]; then
    "$SCRIPT_DIR/scripts/check-secrets.sh"
fi

# Run quick validation (optional - can be slow)
# Uncomment to enable validation on every commit
# if [[ -f "$SCRIPT_DIR/scripts/validate-monorepo.sh" ]]; then
#     "$SCRIPT_DIR/scripts/validate-monorepo.sh" --quick
# fi

echo ""
echo "✅ Pre-commit checks passed!"
echo ""

exit 0
EOF

    chmod +x "$HOOKS_DIR/pre-commit"
    log_success "Pre-commit hook installed"

    # Make check scripts executable
    log_section "Making check scripts executable"
    chmod +x "$SCRIPT_DIR/check-binaries.sh"
    chmod +x "$SCRIPT_DIR/check-secrets.sh"
    log_success "Check scripts are executable"

    log_header "Installation Complete"
    log_success "Git hooks installed successfully!"
    echo ""
    log_info "The following checks will run on every commit:"
    log_info "  • Binary detection (prevents compiled files)"
    log_info "  • Secret scanning (prevents credential leaks)"
    echo ""
    log_info "To bypass hooks in emergencies: git commit --no-verify"
    log_warning "Only use --no-verify when absolutely necessary!"
    echo ""
}

main "$@"

