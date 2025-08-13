# Test Data for Product Requirements Assistant

This directory contains sample data and responses for end-to-end testing of the PRD workflow.

## Structure

```
testdata/
├── projects/           # Sample project input data
│   ├── ai-chat-widget.json
│   └── mobile-offline-sync.json
└── responses/          # Simulated AI responses for each phase
    ├── ai-chat-widget-phase1-claude.md
    ├── ai-chat-widget-phase2-gemini.md
    ├── ai-chat-widget-phase3-claude.md
    ├── mobile-offline-sync-phase1-claude.md
    ├── mobile-offline-sync-phase2-gemini.md
    └── mobile-offline-sync-phase3-claude.md
```

## Test Scenarios

### AI Chat Widget Integration
- **Input**: Request for an AI-powered chat widget to reduce support tickets
- **Phase 1**: Initial PRD from Claude with comprehensive requirements
- **Phase 2**: Gemini's review focusing on simplification and clarity
- **Phase 3**: Claude's final synthesis combining both perspectives

### Mobile Offline Data Synchronization
- **Input**: Need for offline capabilities in React Native mobile app
- **Phase 1**: Claude's detailed analysis of offline requirements
- **Phase 2**: Gemini's streamlined approach with clear deliverables
- **Phase 3**: Claude's comprehensive final specification

## Running Tests

```bash
# Run end-to-end tests
make test-e2e

# Run all tests
make test-all

# Run performance benchmarks
make benchmark
```

## Test Coverage

The end-to-end tests validate:
- ✅ Project creation with input validation
- ✅ All three phases of the PRD workflow
- ✅ Prompt auto-generation between phases
- ✅ Data persistence and retrieval
- ✅ Project listing functionality
- ✅ Error handling and edge cases
- ✅ Performance benchmarking

## Sample Data Quality

The test data includes:
- **Realistic project scenarios** based on common software requirements
- **Comprehensive responses** that demonstrate the full AI workflow
- **Proper markdown formatting** with section numbering and structure
- **Cross-references between phases** showing how each builds on the previous
- **Business metrics and technical specifications** typical of real PRDs