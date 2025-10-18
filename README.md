# Product Requirements Assistant

A tool for creating Product Requirements Documents with AI assistance.

## What It Does

- 3-phase workflow: Initial draft, review, and finalization
- Uses Claude and Gemini via copy/paste
- Stores projects locally as JSON files
- Exports to markdown

## Architecture

- **Backend**: Go REST API on port 8080
- **Frontend**: Streamlit web UI on port 8501
- **Storage**: Local filesystem

## Setup

### Quick Start

**macOS:**
```bash
./setup-macos.sh
```

**Linux (Ubuntu/Debian):**
```bash
./setup.sh
```

The setup script will:
- Install Go and Python3 if needed
- Install project dependencies
- Run tests
- Check for processes on ports 8080/8501 and offer to kill them
- Start backend and frontend
- Open http://localhost:8501

Stop with `Ctrl+C`.

### Manual Setup

```bash
# Install dependencies
make install

# Terminal 1 - Backend
make run-backend

# Terminal 2 - Frontend
make run-frontend
```

Then open http://localhost:8501

## Usage

1. Create a new project with title and description
2. Copy the Phase 1 prompt and paste into Claude Opus 4
3. Paste Claude's response back into the tool
4. Copy the Phase 2 prompt and paste into Gemini Pro 2.5
5. Paste Gemini's response back
6. Copy the Phase 3 prompt and paste into Claude for final version
7. Download the result as markdown

## Project Structure

```
product-requirements-assistant/
├── backend/          # Go server (port 8080)
├── frontend/         # Streamlit app (port 8501)
├── prompts/          # Prompt templates
├── outputs/          # Generated PRDs
├── Makefile         # Common commands
└── setup-macos.sh   # Automated setup
```

## Configuration

Prompt templates can be edited in the UI or in `prompts/`.

Validation limits:
- Title: 200 characters
- Problems/Description: 100KB
- Context: 50KB
- PRD Content: 200KB

## Troubleshooting

**Port already in use:**
```bash
lsof -ti:8080 | xargs kill -9
lsof -ti:8501 | xargs kill -9
```

Or just run the setup script again - it will handle this automatically.

**Logs:**
```bash
tail -f backend.log frontend.log
```

See [LOGGING.md](LOGGING.md) for detailed error documentation.

## Testing

```bash
# Run all tests
make test-all

# Backend tests only
make test-backend

# Integration tests
make test-integration
```

## Known Limitations

- No direct API integration (requires manual copy/paste)
- Single user only
- Local storage only
- No real-time collaboration
- No version history beyond 3 phases
- Limited to text-based PRDs

## License

MIT License - see [LICENSE](./LICENSE)
