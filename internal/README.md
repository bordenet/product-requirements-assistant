# Internal Packages (Planned Refactoring)

## Current Status

⚠️ **This directory contains planned refactoring work that is NOT yet integrated into the application.**

The files in this directory represent a future architecture where:
- Core business logic is extracted into reusable packages
- Thick clients can use the logic in-process (no HTTP backend required)
- The HTTP API becomes a thin wrapper around core packages

## Current Architecture

**As of v1.5**, the application still uses the original architecture:

```
backend/
├── handlers.go      # HTTP handlers with embedded business logic
├── storage.go       # File system operations
├── validation.go    # Input validation
├── config.go        # Configuration
├── filepool.go      # File caching
├── metrics.go       # Metrics and health checks
└── middleware.go    # HTTP middleware
```

**Thick clients** (WebView2, Electron) currently:
1. Spawn the backend as a subprocess
2. Spawn the frontend as a subprocess
3. Communicate over HTTP to `localhost:8080` and `localhost:8501`

## Planned Architecture

The `internal/` directory contains the target structure:

```
internal/
├── core/           # Business logic (models, storage, validation)
│   ├── storage.go
│   ├── models.go
│   └── validation.go
├── api/            # HTTP handlers (thin wrappers)
│   └── handlers.go
├── config/         # Configuration
│   └── config.go
├── metrics/        # Metrics collection
│   └── metrics.go
└── mock/           # Mock AI generators
    └── generator.go
```

**Future thick clients** will:
1. Import `internal/core` directly
2. Run the 3-phase workflow in-process
3. No HTTP backend required

## Why Not Integrated Yet?

This refactoring requires:
1. **Moving all business logic** from `backend/` to `internal/core/`
2. **Updating all imports** across the codebase
3. **Rewriting thick clients** to use `internal/core` directly
4. **Comprehensive testing** of the new architecture
5. **Updating all documentation** to reflect the new structure

This is estimated at **4-6 hours** of careful work to avoid breaking changes.

## Timeline

- **v1.5**: Current architecture (HTTP-based thick clients)
- **v1.6 (planned)**: Refactored architecture (library-based thick clients)

## Contributing

If you're working on this refactoring:

1. **Start with `internal/core/`**: Move business logic from `backend/` to `internal/core/`
2. **Update `backend/handlers.go`**: Make handlers thin wrappers that call `internal/core/`
3. **Create a thick client example**: Build one thick client (e.g., WebView2) that uses `internal/core` directly
4. **Add tests**: Ensure `internal/core/` has ≥85% test coverage
5. **Update documentation**: Reflect the new architecture in `docs/ARCHITECTURE.md`

## Questions?

See:
- [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) - Current system architecture
- [`docs/decisions/REFACTORING_PLAN.md`](../docs/decisions/REFACTORING_PLAN.md) - Detailed refactoring plan
- [`docs/_archive/V1.5_IMPLEMENTATION_STATUS.md`](../docs/_archive/V1.5_IMPLEMENTATION_STATUS.md) - v1.5 implementation status

