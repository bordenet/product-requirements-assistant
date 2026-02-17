# Contributing to Product Requirements Assistant

We welcome contributions to this project!

## Getting Started

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR-USERNAME/product-requirements-assistant.git`
3. **Create** a feature branch: `git checkout -b feature/your-feature`
4. **Set up** the project: `./scripts/setup-macos.sh` (or your platform's setup script)

## Development Workflow

### Before You Start

Read these documents:
- [`AGENTS.md`](AGENTS.md) - AI assistant instructions and standards
- [`README.md`](README.md) - Project overview

### Making Changes

1. **Write tests first** (TDD approach):
   ```bash
   npm run test:watch
   ```

2. **Write your code** following the style guide:
   - Use ES6+ features
   - Double quotes for strings
   - 2-space indentation
   - Descriptive variable names
   - JSDoc comments for functions

3. **Lint your code**:
   ```bash
   npm run lint:fix
   ```

4. **Run all tests**:
   ```bash
   npm test
   npm run test:coverage
   ```

5. **Verify coverage** meets 85% threshold:
   ```bash
   npm run test:coverage
   ```

### Code Style Guide

**JavaScript**:
- ES6+ syntax (const/let, arrow functions, async/await)
- Double quotes: `"string"`
- 2-space indentation
- Semicolons required
- No console.log in production code
- JSDoc comments for all functions

**Example**:
```javascript
/**
 * Save a project to storage
 * @param {Object} project - The project to save
 * @returns {Promise<string>} The project ID
 */
export async function saveProject(project) {
  if (!project.title) {
    throw new Error("Project title is required");
  }

  const result = await storage.saveProject(project);
  return result;
}
```

### Testing Standards

- **Coverage**: ≥85% (statements, branches, functions, lines)
- **Test structure**: One test file per module
- **Test names**: Describe what is being tested
- **Mocks**: Mock external dependencies only

```javascript
test("should save project with valid data", async () => {
  const project = { id: "1", title: "Test" };
  const result = await saveProject(project);
  expect(result).toBe("1");
});
```

## Commit Messages

Format: `<type>: <description>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test changes
- `refactor`: Code refactoring
- `chore`: Maintenance

Examples:
```
feat: Add PRD export to PDF
fix: Resolve dark mode toggle issue
docs: Update deployment guide
test: Add integration tests for workflow
```

## Pull Request Process

1. **Update your branch**: `git pull origin main`
2. **Push your changes**: `git push origin feature/your-feature`
3. **Create a Pull Request** on GitHub
4. **Describe your changes**: What problem does this solve?
5. **Link related issues**: "Fixes #123"
6. **Wait for review**: Maintainers will review your code

### PR Checklist

- [ ] Tests pass (`npm test`)
- [ ] Coverage ≥85% (`npm run test:coverage`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] Commit messages are descriptive

## Testing Guidelines

### Writing Tests

```javascript
import { functionToTest } from "../js/module.js";

describe("Module Name", () => {
  test("should do something specific", () => {
    const result = functionToTest(input);
    expect(result).toBe(expectedValue);
  });

  test("should handle error cases", () => {
    expect(() => functionToTest(invalid)).toThrow();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- storage.test.js

# Run in watch mode
npm run test:watch

# Check coverage
npm run test:coverage
```

## Documentation

When adding features, update:
- README.md (if user-facing)
- Comments in code
- This file (if process changes)
- Architecture documentation (if architectural)

## Questions?

- Check existing [Issues](https://github.com/bordenet/product-requirements-assistant/issues)
- Review [Architecture Decision Record](https://github.com/bordenet/architecture-decision-record) for similar patterns

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Product Requirements Assistant!**
