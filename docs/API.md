# API Documentation

## Base URL

```
http://localhost:8080
```

## Endpoints

### Health Check

**GET** `/api/health`

Returns server health status.

**Response**:
```json
{
  "status": "healthy"
}
```

### Create Project

**POST** `/api/projects`

Creates a new PRD project.

**Request Body**:
```json
{
  "title": "Project Title",
  "problems": "Problems to solve...",
  "context": "Additional context..."
}
```

**Response**: Project object with generated Phase 1 prompt

**Status Codes**:
- `200`: Success
- `400`: Invalid input (missing fields, too long, forbidden content)

### Get Project

**GET** `/api/projects/{id}`

Retrieves a project by ID.

**Parameters**:
- `id` (path): UUID of the project

**Response**: Complete project object with all phases

**Status Codes**:
- `200`: Success
- `400`: Invalid project ID format
- `404`: Project not found

### List Projects

**GET** `/api/projects`

Lists all projects, sorted by creation date (newest first).

**Response**: Array of project objects

### Update Phase

**POST** `/api/projects/{id}/phase/{phase}`

Updates a specific phase with AI-generated content.

**Parameters**:
- `id` (path): UUID of the project
- `phase` (path): Phase number (1, 2, or 3)

**Request Body**:
```json
{
  "content": "AI-generated PRD content..."
}
```

**Response**: Updated project object with next phase prompt auto-generated

**Status Codes**:
- `200`: Success
- `400`: Invalid input or phase number
- `404`: Project not found

### Get Prompt Template

**GET** `/api/prompts/{phase}`

Retrieves a prompt template.

**Parameters**:
- `phase` (path): `claude_initial`, `gemini_review`, or `claude_compare`

**Response**:
```json
{
  "content": "Prompt template text..."
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid phase name
- `404`: Prompt not found

### Update Prompt Template

**POST** `/api/prompts/{phase}`

Updates a prompt template.

**Parameters**:
- `phase` (path): `claude_initial`, `gemini_review`, or `claude_compare`

**Request Body**:
```json
{
  "content": "Updated prompt template..."
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid input

## Monitoring Endpoints

### Metrics

**GET** `/api/metrics`

Returns application metrics including request counts, error rates, memory usage, and file system stats.

### Health Check (Detailed)

**GET** `/api/healthz`

Returns detailed health information including uptime, version, and directory accessibility.

### Readiness Probe

**GET** `/api/readiness`

Returns readiness status for load balancers. Checks file manager initialization and directory accessibility.

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

## Rate Limiting

- **Default**: 100 requests per minute per IP
- **Response**: `429 Too Many Requests` when exceeded
- **Reset**: 1 minute window

## Request Size Limits

- **Maximum Request Size**: 10MB
- **Title**: 200 characters
- **Problems/Description**: 100KB
- **Context**: 50KB
- **PRD Content**: 200KB

