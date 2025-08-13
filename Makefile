.PHONY: all backend frontend run-backend run-frontend install clean format lint health-check test-health test-integration validate-setup test-backend test-e2e test-all benchmark

all: install

install:
	cd backend && go mod download && go mod tidy
	pip install -r requirements.txt

run-backend:
	cd backend && go run .

run-frontend:
	cd frontend && streamlit run app.py

run: 
	@echo "Starting Product Requirements Factory..."
	@echo "Run 'make run-backend' in one terminal"
	@echo "Run 'make run-frontend' in another terminal"

clean:
	rm -rf outputs/*.md outputs/*.json
	find . -name "*.pyc" -delete
	find . -name "__pycache__" -delete

test-backend:
	cd backend && go test ./...

test-e2e:
	cd backend && go test -v -run TestEndToEndWorkflow

test-all:
	cd backend && go test -v ./...

benchmark:
	cd backend && go test -bench=. -benchmem

format:
	cd backend && go fmt ./...
	cd frontend && python -m black *.py

lint:
	cd backend && go vet ./...

health-check:
	@echo "Checking backend health..."
	@curl -s http://localhost:8080/api/health || echo "Backend not responding"

test-health:
	@echo "Testing health check endpoint..."
	@response=$$(curl -s -w "%{http_code}" http://localhost:8080/api/health) && \
	if [ "$${response: -3}" = "200" ]; then \
		echo "✅ Health check passed"; \
	else \
		echo "❌ Health check failed with status: $${response: -3}"; \
		exit 1; \
	fi

test-integration:
	@echo "Starting integration tests..."
	@echo "Testing all API endpoints..."
	@./scripts/integration-test.sh

validate-setup:
	@echo "Validating project setup..."
	@if [ ! -d "outputs" ]; then echo "❌ outputs directory missing"; exit 1; fi
	@if [ ! -d "inputs" ]; then echo "❌ inputs directory missing"; exit 1; fi
	@if [ ! -d "prompts" ]; then echo "❌ prompts directory missing"; exit 1; fi
	@if [ ! -f "prompts/claude_initial.txt" ]; then echo "❌ claude_initial.txt missing"; exit 1; fi
	@if [ ! -f "prompts/gemini_review.txt" ]; then echo "❌ gemini_review.txt missing"; exit 1; fi
	@if [ ! -f "prompts/claude_compare.txt" ]; then echo "❌ claude_compare.txt missing"; exit 1; fi
	@echo "✅ Project setup validated"
