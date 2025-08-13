# Product Requirements Assistant

## Overview
This is a Product Requirements Document (PRD) creation tool with a 3-phase AI-assisted workflow. The application uses Claude and Gemini AI to generate comprehensive PRDs through an interactive process.

## Architecture
- **Backend**: Go REST API server (port 8080)
- **Frontend**: Python Streamlit web application (port 8501)
- **Storage**: Local file system for projects, prompts, and outputs

## Key Directories
- `backend/`: Go REST API with handlers for project management
- `frontend/`: Streamlit UI with interactive workflow
- `prompts/`: Customizable prompt templates for each phase
- `inputs/`: Input documents and project data
- `outputs/`: Generated PRDs and project files (JSON format)

## Development Commands
```bash
# Install dependencies
make install

# Start backend (terminal 1)
make run-backend

# Start frontend (terminal 2) 
make run-frontend

# Test backend
make test-backend

# Format code
make format

# Clean outputs
make clean
```

## Tech Stack
- **Backend**: Go 1.21, Gorilla Mux router, CORS enabled
- **Frontend**: Python, Streamlit 1.28.2, Requests 2.31.0
- **Dependencies**: UUID generation, JSON storage

## Workflow
1. **Phase 1**: Generate initial prompt for Claude Opus 4
2. **Phase 2**: Review Phase 1 output with Gemini Pro 2.5
3. **Phase 3**: Compare both versions and create final PRD with Claude

## Files to Note
- `backend/main.go`: Main server entry point with API routes
- `backend/handlers.go`: API endpoint implementations
- `backend/models.go`: Data structures for projects and phases
- `backend/storage.go`: File system operations
- `frontend/app.py`: Main Streamlit application
- `frontend/api_client.py`: HTTP client for backend communication

## API Endpoints
- `GET /api/health`: Health check
- `POST /api/projects`: Create new project
- `GET /api/projects/{id}`: Get project details
- `POST /api/projects/{id}/phase/{phase}`: Update phase data
- `GET /api/prompts/{phase}`: Get prompt template
- `POST /api/prompts/{phase}`: Update prompt template
- `GET /api/projects`: List all projects

## Development Notes
- Backend serves on localhost:8080
- Frontend serves on localhost:8501
- CORS configured for cross-origin requests
- Project data stored as JSON files with UUID filenames
- Supports markdown export of final PRDs