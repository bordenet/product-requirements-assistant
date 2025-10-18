# Logging and Error Tracking

## Log File Locations

### Primary Log Files

1. **`backend.log`** - Backend (Go) server logs
   - **Location**: `./backend.log` (project root)
   - **Contains**:
     - Server startup and configuration
     - HTTP request logs (method, path, status code, duration)
     - Port binding errors
     - Validation errors
     - Rate limiting events
     - File I/O warnings

2. **`frontend.log`** - Frontend (Streamlit) logs
   - **Location**: `./frontend.log` (project root)
   - **Contains**:
     - Streamlit application startup
     - Port information
     - SSL/TLS warnings
     - Application errors

## Viewing Logs

### View Backend Logs
```bash
# View all logs
cat backend.log

# Watch logs in real-time
tail -f backend.log

# View last 50 lines
tail -n 50 backend.log
```

### View Frontend Logs
```bash
# View all logs
cat frontend.log

# Watch logs in real-time
tail -f frontend.log
```

### View Both Logs Simultaneously
```bash
# Watch both logs in real-time
tail -f backend.log frontend.log
```

## Error Locations in Code

### Backend Error Logging

| File | Line(s) | Type | Description |
|------|---------|------|-------------|
| `backend/main.go` | 21-40 | FATAL | Configuration and validation errors |
| `backend/main.go` | 100-105 | FATAL | Server startup errors (e.g., port in use) |
| `backend/main.go` | 126 | ERROR | Graceful shutdown errors |
| `backend/handlers.go` | 147, 157 | WARNING | Prompt file loading warnings |
| `backend/middleware.go` | 108 | INFO | Rate limit exceeded for IP |
| `backend/middleware.go` | 127 | INFO | All HTTP requests |

### Frontend Error Handling

| File | Line(s) | Type | Description |
|------|---------|------|-------------|
| `frontend/app.py` | 27-58 | ERROR | API error handling with user-friendly messages |
| `frontend/app.py` | 71-74 | ERROR | Backend connection errors |
| `frontend/app.py` | 145-146 | ERROR | Project creation errors |
| `frontend/app.py` | 255-256 | ERROR | Phase 1 save errors |
| `frontend/app.py` | 367-368 | ERROR | Phase 2 save errors |
| `frontend/app.py` | 454-455 | ERROR | Phase 3 save errors |

## Common Errors and Solutions

### "Address already in use" (Port 8080 or 8501)

**Error in `backend.log`:**
```
Server failed to start: listen tcp :8080: bind: address already in use
```

**Solution:**
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Kill process on port 8501
lsof -ti:8501 | xargs kill -9

# Or use the setup script which does this automatically
./setup-macos.sh
```

### "Cannot connect to backend"

**Error in UI:**
```
❌ Cannot connect to backend at http://localhost:8080
```

**Solution:**
1. Check if backend is running:
   ```bash
   curl http://localhost:8080/api/health
   ```

2. Check `backend.log` for startup errors

3. Restart backend:
   ```bash
   cd backend && go run .
   ```

### Large Request Errors

**Error in `backend.log`:**
```
http: request body too large
```

**Solution:**
- Maximum request size is 10MB (configurable in `backend/config.go`)
- Or increase `MaxRequestSize` in configuration

**Validation Limits (Updated 2025-10-17):**
- Title: 200 characters
- Problems/Description: 100,000 characters (~100KB) - supports large PRD inputs
- Context: 50,000 characters (~50KB)
- PRD Content: 200,000 characters (~200KB)
- HTTP Request Size: 10MB total

These limits now support very large PRD inputs including comprehensive technical specifications.

### Rate Limit Exceeded

**Error in `backend.log`:**
```
Rate limit exceeded for IP: 127.0.0.1
```

**Solution:**
- Wait 1 minute for rate limit to reset
- Default limit: 100 requests/minute (configurable in `backend/config.go`)

## Log Format

### Backend HTTP Request Logs
```
<METHOD> <PATH> <STATUS_CODE> <DURATION>
```

Example:
```
GET /api/health 200 32.167µs
POST /api/projects 200 941.125µs
GET /api/projects 404 75.709µs
```

### Backend Startup Logs
```
=== Product Requirements Assistant Configuration ===
Environment: development
Port: 8080
Allowed Origins: [http://localhost:8501]
Max Request Size: 10485760 bytes (10.00 MB)
Rate Limit: 100 requests/minute
Log Level: INFO
================================================
```

## Monitoring in Production

### Health Checks
```bash
# Backend health
curl http://localhost:8080/api/health

# Backend readiness (includes dependency checks)
curl http://localhost:8080/api/readiness

# Detailed health with metrics
curl http://localhost:8080/api/healthz
```

### Metrics Endpoint
```bash
# Get application metrics
curl http://localhost:8080/api/metrics
```

Returns:
```json
{
  "projects_created": 10,
  "phases_updated": 25,
  "uptime_seconds": 3600,
  "requests_total": 150
}
```

## Debug Mode

To enable verbose logging, set environment variable:

```bash
# Backend
export LOG_LEVEL=DEBUG
cd backend && go run .

# Frontend
export STREAMLIT_LOG_LEVEL=debug
cd frontend && python3 -m streamlit run app.py
```

## Setup Script Improvements

The setup scripts (`setup.sh` and `setup-macos.sh`) now automatically:
1. Check if ports 8080, 8501, and 8502 are in use
2. **Display a warning** showing which ports are in use
3. **Prompt for confirmation** with a 3-second timeout (auto-accepts if no response)
4. Kill any existing processes on those ports
5. Start fresh instances of backend and frontend
6. Show clear status messages for each step

### Example Warning Prompt

When ports are in use, you'll see:

```
⚠️  WARNING: The following ports are currently in use:
    - Port 8080 (backend)
    - Port 8501 (frontend)

This script will kill the processes using these ports.

Continue? [Y/n] (auto-yes in 3s):
```

- Press `Y` or `Enter` to continue immediately
- Press `N` to cancel the setup
- Wait 3 seconds for automatic acceptance

This prevents the "address already in use" error that was occurring previously while giving you control over whether to kill existing processes.
