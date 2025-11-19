# Mock AI Testing Guide

## Overview

The Product Requirements Assistant includes a **Mock AI** feature that enables automated testing of the complete 3-phase PRD workflow without manual copy/paste operations. This is particularly useful for:

- **Automated Testing**: Run end-to-end tests without human intervention
- **Development**: Quickly test the full workflow during development
- **Demonstrations**: Show the complete workflow without waiting for AI responses
- **CI/CD**: Validate the entire system in automated pipelines

## How It Works

When Mock AI is enabled, the system can automatically generate realistic AI responses for each phase:

1. **Phase 1 (Claude Initial PRD)**: Generates a comprehensive initial PRD based on the project title and problem description
2. **Phase 2 (Gemini Review)**: Generates a critical review with strengths, weaknesses, and recommendations
3. **Phase 3 (Claude Comparison)**: Generates a final synthesized PRD incorporating feedback

The mock responses are designed to be realistic and comprehensive, mimicking the structure and content of actual AI-generated PRDs.

## Enabling Mock AI

### Option 1: Environment Variable

Set the `MOCK_AI_ENABLED` environment variable:

```bash
export MOCK_AI_ENABLED=true
cd backend && go run .
```

### Option 2: .env File

Add to your `.env` file:

```bash
MOCK_AI_ENABLED=true
```

Then start the backend:

```bash
cd backend && go run .
```

### Verification

When Mock AI is enabled, you'll see this message in the backend logs:

```
Mock AI enabled - automated response generation available
```

## Using Mock AI

### API Endpoint

```
POST /api/projects/{project_id}/generate/{phase}
```

**Parameters:**
- `project_id`: UUID of the project
- `phase`: Phase number (1, 2, or 3)

**Response:** Updated project object with generated content

### Example Workflow

#### 1. Create a Project

```bash
curl -X POST http://localhost:8080/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI Chat Widget",
    "problems": "Users need an AI-powered chat widget for customer support",
    "context": "Enterprise SaaS application"
  }'
```

Response includes `project_id`.

#### 2. Generate Phase 1 (Claude Initial PRD)

```bash
curl -X POST http://localhost:8080/api/projects/{project_id}/generate/1
```

This automatically:
- Generates a comprehensive initial PRD
- Populates Phase 1 content
- Advances project to Phase 2
- Prepares Phase 2 prompt

#### 3. Generate Phase 2 (Gemini Review)

```bash
curl -X POST http://localhost:8080/api/projects/{project_id}/generate/2
```

This automatically:
- Generates a critical review of Phase 1
- Populates Phase 2 content
- Advances project to Phase 3
- Prepares Phase 3 prompt

#### 4. Generate Phase 3 (Claude Comparison)

```bash
curl -X POST http://localhost:8080/api/projects/{project_id}/generate/3
```

This automatically:
- Generates final synthesized PRD
- Populates Phase 3 content
- Saves final PRD to outputs directory

## Testing

### Unit Tests

Run mock AI unit tests:

```bash
cd backend
go test -v -run TestMockAI
```

### Integration Tests

The mock AI is tested as part of the full test suite:

```bash
cd backend
go test -v ./...
```

### Manual Testing

1. Enable Mock AI: `export MOCK_AI_ENABLED=true`
2. Start backend: `cd backend && go run .`
3. Create a project via API or frontend
4. Use the generate endpoint to auto-complete phases

## Security Considerations

### Production Use

**⚠️ WARNING**: Mock AI should **NEVER** be enabled in production environments.

- Mock responses are generic and not tailored to specific use cases
- They are intended for testing and development only
- Production systems should use the manual copy/paste workflow with real AI models

### Access Control

When Mock AI is disabled (default), the generate endpoint returns:

```
403 Forbidden
Mock AI is not enabled. Set MOCK_AI_ENABLED=true to use this feature.
```

## Disabling Mock AI

### Default Behavior

Mock AI is **disabled by default**. If `MOCK_AI_ENABLED` is not set or is set to `false`, the system operates in normal mode with manual copy/paste workflow.

### Explicit Disable

```bash
export MOCK_AI_ENABLED=false
# or
unset MOCK_AI_ENABLED
```

## Mock Response Quality

The mock AI generates responses that include:

- **Realistic Structure**: Proper markdown formatting, sections, and hierarchy
- **Comprehensive Content**: Features, requirements, metrics, timelines, risks
- **Phase-Appropriate Content**:
  - Phase 1: Initial PRD with problem statement, features, architecture
  - Phase 2: Critical review with strengths, weaknesses, recommendations
  - Phase 3: Final PRD incorporating feedback and refinements
- **Metadata**: Timestamps, AI model indicators (Claude/Gemini), phase labels

## Troubleshooting

### Mock AI Not Working

1. **Check Environment Variable**: Ensure `MOCK_AI_ENABLED=true`
2. **Restart Backend**: Changes require backend restart
3. **Check Logs**: Look for "Mock AI enabled" message
4. **Verify Endpoint**: Use correct URL format

### 403 Forbidden Error

This means Mock AI is not enabled. Set `MOCK_AI_ENABLED=true` and restart the backend.

### Invalid Phase Number

Ensure phase number is 1, 2, or 3. Other values will return 400 Bad Request.

### Phase Dependencies

- Phase 2 requires Phase 1 to be completed
- Phase 3 requires Phases 1 and 2 to be completed

## See Also

- [Architecture Documentation](ARCHITECTURE.md)
- [API Documentation](API.md)
- [Contributing Guide](../CONTRIBUTING.md)

