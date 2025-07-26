# Product Requirements Assistant

An interactive tool for creating Product Requirements Documents using Claude and Gemini AI assistants.

## Features

- 3-phase PRD creation workflow
- Customizable prompts for each phase
- Local storage of all versions
- Markdown export
- Interactive Streamlit UI
- Go backend with REST API
- Python/Streamlit frontend

## Architecture

- **Backend (Go)**: REST API server handling project management, file storage, and business logic
- **Frontend (Python/Streamlit)**: Interactive web UI for the PRD workflow
- **Storage**: Local file system for projects and prompts

## Setup

1. Install dependencies:
   ```bash
   make install
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. Start the backend (terminal 1):
   ```bash
   make run-backend
   ```

3. Start the frontend (terminal 2):
   ```bash
   make run-frontend
   ```

4. Open http://localhost:8501 in your browser

## Usage

1. **Create New Project**: Enter your document title, problems to solve, and context
2. **Phase 1**: Copy the generated prompt and paste into Claude Opus 4
3. **Phase 2**: Take Claude's output and have Gemini Pro 2.5 review it
4. **Phase 3**: Have Claude compare both versions and create the final PRD
5. **Export**: Download the final PRD as markdown

## Customization

Edit prompt templates through the UI or directly in the `prompts/` directory.

## Project Structure

```
product-requirements-assistant/
├── backend/          # Go REST API
├── frontend/         # Python/Streamlit UI
├── prompts/          # Customizable prompt templates
├── inputs/           # Input documents
├── outputs/          # Generated PRDs and project files
├── go.mod           # Go dependencies
├── requirements.txt  # Python dependencies
├── Makefile         # Build and run commands
└── README.md        # This file
```

## Future Enhancements

- Direct API integration with Claude and Gemini
- LangGraph orchestration for automated workflow
- Confluence integration
- Authentication and multi-user support
- Cloud deployment options

## License

This project is licensed under the MIT License – see the [LICENSE](./LICENSE) file for details.
