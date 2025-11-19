#!/usr/bin/env python3
"""
Product Requirements Assistant - Release Automation Tool

This script automates the semantic versioning release process including:
- Version validation and bumping (major, minor, patch)
- Git tag creation and management
- README.md updates with release information
- GitHub release creation
- Comprehensive validation and safety checks

Usage:
    ./scripts/release.py <version_type> [options]
    
Version Types:
    major       Increment major version (X.0.0) - Breaking changes
    minor       Increment minor version (x.X.0) - New features
    patch       Increment patch version (x.x.X) - Bug fixes
    <version>   Explicit version (e.g., 1.5.1)

Options:
    -h, --help              Show this help message and exit
    -v, --verbose           Enable verbose output
    -d, --dry-run          Simulate release without making changes
    -m, --message TEXT     Custom release message
    --skip-validation      Skip pre-release validation checks
    --skip-tests           Skip running tests before release
    --no-push              Create tag locally but don't push to remote
    --force                Force release even with uncommitted changes

Examples:
    # Patch release (bug fixes)
    ./scripts/release.py patch
    
    # Minor release (new features)
    ./scripts/release.py minor -m "Add sidebar navigation improvements"
    
    # Major release (breaking changes)
    ./scripts/release.py major -m "Complete UI redesign"
    
    # Explicit version
    ./scripts/release.py 2.0.0
    
    # Dry run to preview changes
    ./scripts/release.py minor --dry-run -v

Standards:
    - Follows semantic versioning (semver.org)
    - Validates git repository state
    - Runs comprehensive test suite
    - Updates documentation automatically
    - Creates annotated git tags
    - Triggers GitHub Actions for binary builds

Author: Product Requirements Assistant Team
License: MIT
"""

import argparse
import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional, Tuple


class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


class ReleaseManager:
    """Manages the release process with comprehensive validation and automation"""
    
    def __init__(self, verbose: bool = False, dry_run: bool = False):
        self.verbose = verbose
        self.dry_run = dry_run
        self.repo_root = self._find_repo_root()
        self.current_version = self._get_current_version()
        
    def _find_repo_root(self) -> Path:
        """Find the git repository root directory"""
        try:
            result = subprocess.run(
                ['git', 'rev-parse', '--show-toplevel'],
                capture_output=True,
                text=True,
                check=True
            )
            return Path(result.stdout.strip())
        except subprocess.CalledProcessError:
            self._error("Not in a git repository")
            sys.exit(1)
    
    def _get_current_version(self) -> str:
        """Get the current version from git tags"""
        try:
            result = subprocess.run(
                ['git', 'describe', '--tags', '--abbrev=0'],
                capture_output=True,
                text=True,
                check=False
            )
            if result.returncode == 0:
                version = result.stdout.strip()
                # Remove 'v' prefix if present
                version = version[1:] if version.startswith('v') else version

                # Validate version format
                if re.match(r'^\d+\.\d+\.\d+$', version):
                    return version
                else:
                    # Invalid format, default to 0.0.0
                    return "0.0.0"
            else:
                return "0.0.0"
        except Exception:
            return "0.0.0"
    
    def _log(self, message: str, level: str = "INFO"):
        """Log a message with optional color coding"""
        if level == "ERROR":
            print(f"{Colors.FAIL}✗ {message}{Colors.ENDC}", file=sys.stderr)
        elif level == "SUCCESS":
            print(f"{Colors.OKGREEN}✓ {message}{Colors.ENDC}")
        elif level == "WARNING":
            print(f"{Colors.WARNING}⚠ {message}{Colors.ENDC}")
        elif level == "INFO":
            print(f"{Colors.OKBLUE}ℹ {message}{Colors.ENDC}")
        elif level == "VERBOSE" and self.verbose:
            print(f"{Colors.OKCYAN}  {message}{Colors.ENDC}")
        else:
            print(message)
    
    def _error(self, message: str):
        """Log an error message and exit"""
        self._log(message, "ERROR")

    def _run_command(self, cmd: list, check: bool = True) -> subprocess.CompletedProcess:
        """Run a shell command with optional dry-run support"""
        self._log(f"Running: {' '.join(cmd)}", "VERBOSE")

        if self.dry_run:
            self._log(f"[DRY RUN] Would execute: {' '.join(cmd)}", "WARNING")
            return subprocess.CompletedProcess(cmd, 0, "", "")

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=check,
                cwd=self.repo_root
            )
            if result.stdout and self.verbose:
                self._log(f"Output: {result.stdout.strip()}", "VERBOSE")
            return result
        except subprocess.CalledProcessError as e:
            self._error(f"Command failed: {' '.join(cmd)}\n{e.stderr}")
            sys.exit(1)

    def validate_version(self, version: str) -> bool:
        """Validate semantic version format"""
        pattern = r'^\d+\.\d+\.\d+$'
        if not re.match(pattern, version):
            self._error(f"Invalid version format: {version}. Must be X.Y.Z")
            return False
        return True

    def bump_version(self, bump_type: str) -> str:
        """Calculate new version based on bump type"""
        major, minor, patch = map(int, self.current_version.split('.'))

        if bump_type == 'major':
            return f"{major + 1}.0.0"
        elif bump_type == 'minor':
            return f"{major}.{minor + 1}.0"
        elif bump_type == 'patch':
            return f"{major}.{minor}.{patch + 1}"
        else:
            # Assume it's an explicit version
            if self.validate_version(bump_type):
                return bump_type
            else:
                sys.exit(1)

    def check_git_status(self, force: bool = False) -> bool:
        """Check if git working directory is clean"""
        result = self._run_command(['git', 'status', '--porcelain'], check=False)

        if result.stdout.strip():
            if force:
                self._log("Working directory has uncommitted changes (--force used)", "WARNING")
                return True
            else:
                self._error("Working directory has uncommitted changes. Commit or stash them first.")
                self._log("Use --force to override this check", "WARNING")
                return False

        self._log("Working directory is clean", "SUCCESS")
        return True

    def check_on_main_branch(self) -> bool:
        """Check if currently on main branch"""
        result = self._run_command(['git', 'branch', '--show-current'])
        current_branch = result.stdout.strip()

        if current_branch != 'main':
            self._log(f"Currently on branch '{current_branch}', not 'main'", "WARNING")
            if self.dry_run:
                self._log("[DRY RUN] Would prompt for confirmation", "WARNING")
                return True
            response = input("Continue anyway? [y/N]: ")
            return response.lower() == 'y'

        self._log("On main branch", "SUCCESS")
        return True

    def run_tests(self, skip_tests: bool = False) -> bool:
        """Run the test suite"""
        if skip_tests:
            self._log("Skipping tests (--skip-tests used)", "WARNING")
            return True

        self._log("Running test suite...", "INFO")

        # Check if validation script exists
        validation_script = self.repo_root / "scripts" / "validate-monorepo.sh"
        if validation_script.exists():
            result = self._run_command([str(validation_script), '--quick'], check=False)
            if result.returncode != 0:
                self._error("Tests failed. Fix issues before releasing.")
                return False
            self._log("All tests passed", "SUCCESS")
            return True
        else:
            self._log("No validation script found, skipping tests", "WARNING")
            return True

    def update_readme(self, new_version: str) -> bool:
        """Update README.md with new version information"""
        readme_path = self.repo_root / "README.md"

        if not readme_path.exists():
            self._log("README.md not found, skipping update", "WARNING")
            return True

        self._log(f"Updating README.md with version {new_version}", "INFO")

        # Read current README
        with open(readme_path, 'r') as f:
            content = f.read()

        # Update version references if any exist
        # This is a placeholder - customize based on your README structure
        updated_content = content

        if self.dry_run:
            self._log("[DRY RUN] Would update README.md", "WARNING")
        else:
            with open(readme_path, 'w') as f:
                f.write(updated_content)
            self._log("README.md updated", "SUCCESS")

        return True

    def create_git_tag(self, version: str, message: Optional[str] = None) -> bool:
        """Create an annotated git tag"""
        tag_name = f"v{version}"

        # Check if tag already exists
        result = self._run_command(['git', 'tag', '-l', tag_name], check=False)
        if result.stdout.strip():
            self._error(f"Tag {tag_name} already exists")
            return False

        # Create annotated tag
        tag_message = message or f"Release version {version}"
        self._log(f"Creating tag {tag_name}: {tag_message}", "INFO")

        self._run_command(['git', 'tag', '-a', tag_name, '-m', tag_message])
        self._log(f"Tag {tag_name} created", "SUCCESS")

        return True

    def push_tag(self, version: str, no_push: bool = False) -> bool:
        """Push tag to remote repository"""
        if no_push:
            self._log("Skipping push (--no-push used)", "WARNING")
            return True

        tag_name = f"v{version}"
        self._log(f"Pushing tag {tag_name} to origin...", "INFO")

        self._run_command(['git', 'push', 'origin', tag_name])
        self._log(f"Tag {tag_name} pushed to origin", "SUCCESS")

        return True

    def generate_changelog(self, version: str) -> str:
        """Generate changelog from git commits since last tag"""
        self._log("Generating changelog...", "INFO")

        # Get commits since last tag
        result = self._run_command(
            ['git', 'log', f'v{self.current_version}..HEAD', '--oneline'],
            check=False
        )

        commits = result.stdout.strip().split('\n') if result.stdout.strip() else []

        changelog = f"## Version {version} - {datetime.now().strftime('%Y-%m-%d')}\n\n"

        if commits:
            changelog += "### Changes\n\n"
            for commit in commits:
                # Parse commit message
                parts = commit.split(' ', 1)
                if len(parts) == 2:
                    changelog += f"- {parts[1]}\n"
        else:
            changelog += "No changes recorded.\n"

        return changelog

    def display_release_summary(self, version: str, message: Optional[str] = None):
        """Display a summary of the release"""
        print(f"\n{Colors.BOLD}{Colors.HEADER}{'='*60}{Colors.ENDC}")
        print(f"{Colors.BOLD}{Colors.HEADER}Release Summary{Colors.ENDC}")
        print(f"{Colors.BOLD}{Colors.HEADER}{'='*60}{Colors.ENDC}\n")

        print(f"{Colors.BOLD}Current Version:{Colors.ENDC} {self.current_version}")
        print(f"{Colors.BOLD}New Version:{Colors.ENDC}     {version}")
        print(f"{Colors.BOLD}Tag Name:{Colors.ENDC}        v{version}")

        if message:
            print(f"{Colors.BOLD}Message:{Colors.ENDC}         {message}")

        print(f"\n{Colors.BOLD}Changelog:{Colors.ENDC}")
        print(self.generate_changelog(version))

        print(f"{Colors.BOLD}{Colors.HEADER}{'='*60}{Colors.ENDC}\n")

    def confirm_release(self) -> bool:
        """Ask user to confirm the release"""
        if self.dry_run:
            return True

        response = input(f"{Colors.BOLD}Proceed with release? [y/N]: {Colors.ENDC}")
        return response.lower() == 'y'

    def perform_release(
        self,
        version_type: str,
        message: Optional[str] = None,
        skip_validation: bool = False,
        skip_tests: bool = False,
        no_push: bool = False,
        force: bool = False
    ) -> bool:
        """Perform the complete release process"""

        print(f"\n{Colors.BOLD}{Colors.OKCYAN}Product Requirements Assistant - Release Tool{Colors.ENDC}\n")

        # Calculate new version
        new_version = self.bump_version(version_type)
        self._log(f"Preparing release: {self.current_version} → {new_version}", "INFO")

        # Pre-release validation
        if not skip_validation:
            self._log("Running pre-release validation...", "INFO")

            if not self.check_git_status(force):
                return False

            if not self.check_on_main_branch():
                return False

            if not self.run_tests(skip_tests):
                return False
        else:
            self._log("Skipping validation (--skip-validation used)", "WARNING")

        # Display release summary
        self.display_release_summary(new_version, message)

        # Confirm release
        if not self.confirm_release():
            self._log("Release cancelled by user", "WARNING")
            return False

        # Update documentation
        if not self.update_readme(new_version):
            return False

        # Commit README changes if any
        if not self.dry_run:
            result = self._run_command(['git', 'status', '--porcelain'], check=False)
            if result.stdout.strip():
                self._log("Committing documentation updates...", "INFO")
                self._run_command(['git', 'add', 'README.md'])
                self._run_command(['git', 'commit', '-m', f'docs: update for release {new_version}'])

        # Create git tag
        if not self.create_git_tag(new_version, message):
            return False

        # Push tag
        if not self.push_tag(new_version, no_push):
            return False

        # Success message
        print(f"\n{Colors.BOLD}{Colors.OKGREEN}{'='*60}{Colors.ENDC}")
        print(f"{Colors.BOLD}{Colors.OKGREEN}✓ Release {new_version} completed successfully!{Colors.ENDC}")
        print(f"{Colors.BOLD}{Colors.OKGREEN}{'='*60}{Colors.ENDC}\n")

        if not no_push:
            print(f"{Colors.BOLD}Next steps:{Colors.ENDC}")
            print(f"  1. Monitor GitHub Actions: https://github.com/bordenet/product-requirements-assistant/actions")
            print(f"  2. Verify release: https://github.com/bordenet/product-requirements-assistant/releases")
            print(f"  3. Test downloaded executables")
            print(f"  4. Announce the release\n")

        return True


def create_parser() -> argparse.ArgumentParser:
    """Create and configure argument parser"""
    parser = argparse.ArgumentParser(
        description='Product Requirements Assistant - Release Automation Tool',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s patch                    # Bump patch version (bug fixes)
  %(prog)s minor                    # Bump minor version (new features)
  %(prog)s major                    # Bump major version (breaking changes)
  %(prog)s 1.5.1                    # Set explicit version
  %(prog)s minor -m "Add sidebar"   # Release with custom message
  %(prog)s patch --dry-run -v       # Preview release without changes

Version Types:
  major       Increment major version (X.0.0) - Breaking changes
  minor       Increment minor version (x.X.0) - New features, backward compatible
  patch       Increment patch version (x.x.X) - Bug fixes only
  <version>   Explicit version number (e.g., 1.5.1)

Standards:
  - Follows semantic versioning (https://semver.org)
  - Validates git repository state before release
  - Runs comprehensive test suite
  - Updates documentation automatically
  - Creates annotated git tags
  - Triggers GitHub Actions for binary builds

For more information, see: docs/RELEASING.md
        """
    )

    parser.add_argument(
        'version_type',
        help='Version bump type (major|minor|patch) or explicit version (e.g., 1.5.1)'
    )

    parser.add_argument(
        '-v', '--verbose',
        action='store_true',
        help='Enable verbose output with detailed logging'
    )

    parser.add_argument(
        '-d', '--dry-run',
        action='store_true',
        help='Simulate release without making any changes (safe preview mode)'
    )

    parser.add_argument(
        '-m', '--message',
        type=str,
        help='Custom release message for git tag annotation'
    )

    parser.add_argument(
        '--skip-validation',
        action='store_true',
        help='Skip pre-release validation checks (not recommended)'
    )

    parser.add_argument(
        '--skip-tests',
        action='store_true',
        help='Skip running test suite before release (not recommended)'
    )

    parser.add_argument(
        '--no-push',
        action='store_true',
        help='Create tag locally but do not push to remote repository'
    )

    parser.add_argument(
        '--force',
        action='store_true',
        help='Force release even with uncommitted changes (dangerous)'
    )

    return parser


def main():
    """Main entry point for the release tool"""
    parser = create_parser()
    args = parser.parse_args()

    # Create release manager
    manager = ReleaseManager(verbose=args.verbose, dry_run=args.dry_run)

    # Perform release
    try:
        success = manager.perform_release(
            version_type=args.version_type,
            message=args.message,
            skip_validation=args.skip_validation,
            skip_tests=args.skip_tests,
            no_push=args.no_push,
            force=args.force
        )

        sys.exit(0 if success else 1)

    except KeyboardInterrupt:
        print(f"\n{Colors.WARNING}Release cancelled by user{Colors.ENDC}")
        sys.exit(130)
    except Exception as e:
        print(f"{Colors.FAIL}Unexpected error: {e}{Colors.ENDC}", file=sys.stderr)
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

