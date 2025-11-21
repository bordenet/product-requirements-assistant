#!/usr/bin/env bash
set -euo pipefail

################################################################################
# Web App Deployment Script
################################################################################
# PURPOSE: Deploy web app to GitHub Pages with minimal vertical output
# USAGE: ./scripts/deploy-web.sh [OPTIONS]
# OPTIONS:
#   -v, --verbose    Show detailed output
#   -h, --help       Show this help message
#   -n, --dry-run    Show what would be deployed without deploying
################################################################################

# Source compact output library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib/compact.sh
source "${SCRIPT_DIR}/lib/compact.sh"

################################################################################
# Configuration
################################################################################

readonly DOCS_DIR="docs"
readonly WEB_DIR="web"
readonly REQUIRED_FILES=(
    "${WEB_DIR}/index.html"
    "${WEB_DIR}/css/styles.css"
    "${WEB_DIR}/js/app.js"
)

################################################################################
# Logging Functions
################################################################################

log_verbose() {
    if [[ ${VERBOSE} -eq 1 ]]; then
        echo -e "${C_GRAY}  $*${C_RESET}"
    fi
}

log_error() {
    echo -e "${C_RED}$*${C_RESET}" >&2
}

################################################################################
# Help Text
################################################################################

show_help() {
    cat << 'EOF'
NAME
    deploy-web.sh - Deploy web app to GitHub Pages

SYNOPSIS
    deploy-web.sh [OPTIONS]

DESCRIPTION
    Deploys the web application to GitHub Pages by copying files from web/
    to docs/ directory. The docs/ directory is configured as the GitHub Pages
    source in repository settings.

OPTIONS
    -v, --verbose
        Show detailed output including file operations and git commands.
        Default: minimal output with timer.

    -n, --dry-run
        Show what would be deployed without making any changes.
        Useful for verifying deployment before execution.

    -h, --help
        Display this help message and exit.

EXAMPLES
    Deploy web app with minimal output:
        $ ./scripts/deploy-web.sh

    Deploy with verbose output:
        $ ./scripts/deploy-web.sh --verbose

    Preview deployment without changes:
        $ ./scripts/deploy-web.sh --dry-run

    Combine dry-run with verbose:
        $ ./scripts/deploy-web.sh -n -v

DEPLOYMENT PROCESS
    1. Validates required files exist in web/ directory
    2. Copies web app files to docs/ directory
    3. Stages changes in git
    4. Commits with deployment message
    5. Pushes to origin/main
    6. GitHub Pages automatically deploys from docs/

GITHUB PAGES URL
    https://bordenet.github.io/product-requirements-assistant/

EXIT STATUS
    0   Deployment successful
    1   Validation failed or deployment error

SEE ALSO
    docs/deployment/GITHUB_PAGES.md
    https://docs.github.com/en/pages

EOF
}

################################################################################
# Validation
################################################################################

validate_environment() {
    task_start "Validating environment"
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        task_fail "Not in a git repository"
        return 1
    fi
    
    # Check if on main branch
    local current_branch
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [[ "${current_branch}" != "main" ]]; then
        task_fail "Must be on main branch (currently on ${current_branch})"
        return 1
    fi
    
    # Check for uncommitted changes
    if [[ -n $(git status --porcelain) ]]; then
        task_fail "Uncommitted changes detected. Commit or stash first"
        return 1
    fi
    
    task_ok "Environment validated"
}

validate_files() {
    task_start "Validating web app files"
    
    local missing_files=()
    for file in "${REQUIRED_FILES[@]}"; do
        if [[ ! -f "${file}" ]]; then
            missing_files+=("${file}")
        fi
    done
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        task_fail "Missing required files:"
        for file in "${missing_files[@]}"; do
            log_error "  - ${file}"
        done
        return 1
    fi
    
    task_ok "All required files present"
}

################################################################################
# Deployment Functions
################################################################################

copy_web_files() {
    task_start "Copying web app to docs/"

    # Create docs directory if it doesn't exist
    mkdir -p "${DOCS_DIR}"

    # Copy files
    log_verbose "Copying ${WEB_DIR}/ to ${DOCS_DIR}/"

    if [[ ${VERBOSE} -eq 1 ]]; then
        rsync -a --delete \
            --exclude='.DS_Store' \
            --exclude='*.swp' \
            --exclude='README.md' \
            "${WEB_DIR}/" "${DOCS_DIR}/"
    else
        rsync -a --delete \
            --exclude='.DS_Store' \
            --exclude='*.swp' \
            --exclude='README.md' \
            "${WEB_DIR}/" "${DOCS_DIR}/" 2>&1 | grep -v "^rsync" || true
    fi

    task_ok "Files copied"
}

commit_and_push() {
    task_start "Committing changes"

    # Stage changes
    git add "${DOCS_DIR}" 2>&1 | log_verbose_stream

    # Check if there are changes to commit
    if git diff --cached --quiet; then
        task_ok "No changes to deploy"
        return 0
    fi

    # Commit
    local commit_msg="Deploy web app to GitHub Pages

Automated deployment from web/ to docs/
Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"

    log_verbose "Committing with message:"
    log_verbose "${commit_msg}"

    if [[ ${VERBOSE} -eq 1 ]]; then
        git commit -m "${commit_msg}"
    else
        git commit -m "${commit_msg}" >/dev/null 2>&1
    fi

    task_ok "Changes committed"
}

push_to_remote() {
    task_start "Pushing to origin/main"

    log_verbose "Running: git push origin main"

    if [[ ${VERBOSE} -eq 1 ]]; then
        git push origin main
    else
        git push origin main >/dev/null 2>&1
    fi

    task_ok "Pushed to origin/main"
}

################################################################################
# Main Execution
################################################################################

main() {
    local dry_run=0

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -v|--verbose)
                VERBOSE=1
                shift
                ;;
            -n|--dry-run)
                dry_run=1
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                echo "Error: Unknown option: $1" >&2
                echo "Run with --help for usage information" >&2
                exit 1
                ;;
        esac
    done

    # Show header
    if [[ ${VERBOSE} -eq 0 ]]; then
        echo -e "${C_BOLD}Web App Deployment${C_RESET}"
    else
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Web App Deployment to GitHub Pages"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    fi

    # Validation
    validate_environment || exit 1
    validate_files || exit 1

    if [[ ${dry_run} -eq 1 ]]; then
        echo ""
        echo -e "${C_YELLOW}DRY RUN MODE${C_RESET} - No changes will be made"
        echo ""
        echo "Would deploy:"
        for file in "${REQUIRED_FILES[@]}"; do
            echo "  - ${file}"
        done
        echo ""
        echo "Destination: ${DOCS_DIR}/"
        echo "GitHub Pages: https://bordenet.github.io/product-requirements-assistant/"
        exit 0
    fi

    # Deployment
    copy_web_files || exit 1
    commit_and_push || exit 1
    push_to_remote || exit 1

    # Success
    echo ""
    echo -e "${SYM_OK} ${C_GREEN}Deployment successful${C_RESET}"
    echo ""
    echo "GitHub Pages will update in 1-2 minutes:"
    echo "  https://bordenet.github.io/product-requirements-assistant/"
    echo ""
}

# Trap to ensure cursor is shown on exit
trap 'echo -e "${ANSI_SHOW_CURSOR}"' EXIT

main "$@"

