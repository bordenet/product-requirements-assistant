.PHONY: all backend frontend run-backend run-frontend install clean format lint health-check test-health test-integration validate-setup test-backend test-e2e test-all benchmark help build

.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "Product Requirements Assistant - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

all: install ## Install all dependencies

install: ## Install all dependencies
	cd backend && go mod download && go mod tidy
	python3 -m venv venv
	./venv/bin/pip install -r requirements.txt

build: ## Build backend binary
	cd backend && go build -o ../bin/prd-assistant .

run-backend: ## Run backend server
	cd backend && go run .

run-frontend: ## Run frontend UI
	cd frontend && ../venv/bin/python -m streamlit run app.py

run: ## Show instructions for running the application
	@echo "Starting Product Requirements Assistant..."
	@echo "Run 'make run-backend' in one terminal"
	@echo "Run 'make run-frontend' in another terminal"

clean: ## Clean generated files and caches
	rm -rf outputs/*.md outputs/*.json
	rm -rf bin/
	find . -name "*.pyc" -delete
	find . -name "__pycache__" -delete

test-backend: ## Run backend unit tests
	cd backend && go test ./...

test-e2e: ## Run end-to-end tests
	cd backend && go test -v -run TestEndToEndWorkflow

test-all: ## Run all tests with verbose output
	cd backend && go test -v ./...

benchmark: ## Run performance benchmarks
	cd backend && go test -bench=. -benchmem

format: ## Format all code
	cd backend && go fmt ./...
	@if [ -f venv/bin/python ]; then \
		cd frontend && ../venv/bin/python -m black *.py 2>/dev/null || echo "Note: black not installed, skipping Python formatting"; \
	else \
		echo "Note: venv not found, skipping Python formatting"; \
	fi

lint: ## Run linters
	cd backend && go vet ./...

health-check: ## Check if backend is running
	@echo "Checking backend health..."
	@curl -s http://localhost:8080/api/health || echo "Backend not responding"

test-health: ## Test health check endpoint
	@echo "Testing health check endpoint..."
	@response=$$(curl -s -w "%{http_code}" http://localhost:8080/api/health) && \
	if [ "$${response: -3}" = "200" ]; then \
		echo "✅ Health check passed"; \
	else \
		echo "❌ Health check failed with status: $${response: -3}"; \
		exit 1; \
	fi

test-integration: ## Run integration tests (requires backend running)
	@echo "Starting integration tests..."
	@echo "Testing all API endpoints..."
	@./scripts/integration-test.sh

validate-setup: ## Validate project directory structure
	@echo "Validating project setup..."
	@if [ ! -d "outputs" ]; then echo "❌ outputs directory missing"; exit 1; fi
	@if [ ! -d "inputs" ]; then echo "❌ inputs directory missing"; exit 1; fi
	@if [ ! -d "prompts" ]; then echo "❌ prompts directory missing"; exit 1; fi
	@if [ ! -f "prompts/claude_initial.txt" ]; then echo "❌ claude_initial.txt missing"; exit 1; fi
	@if [ ! -f "prompts/gemini_review.txt" ]; then echo "❌ gemini_review.txt missing"; exit 1; fi
	@if [ ! -f "prompts/claude_compare.txt" ]; then echo "❌ claude_compare.txt missing"; exit 1; fi
	@echo "✅ Project setup validated"
