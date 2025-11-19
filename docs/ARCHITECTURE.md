# Architecture Documentation

## System Overview

Product Requirements Assistant is a PRD creation tool with a 3-phase AI-assisted workflow. The application uses Claude Sonnet 4.5 and Gemini 2.5 Pro to generate comprehensive PRDs through an interactive copy/paste process.

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

## Technology Stack

### Backend
- **Language**: Go 1.21+
- **Router**: Gorilla Mux
- **CORS**: rs/cors
- **UUID**: google/uuid
- **Storage**: Local filesystem (JSON)

### Frontend
- **Framework**: Streamlit 1.28.2
- **HTTP Client**: Requests 2.31.0
- **Language**: Python 3.8+

### Infrastructure
- **Ports**: 8080 (backend), 8501 (frontend)
- **Deployment**: Local development, single-user
- **Data**: JSON files with markdown export

## Workflow
1. **Phase 1**: Generate initial prompt for Claude Sonnet 4.5
2. **Phase 2**: Review Phase 1 output with Gemini 2.5 Pro
3. **Phase 3**: Compare both versions and create final PRD with Claude Sonnet 4.5

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