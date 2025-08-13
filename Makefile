.PHONY: all backend frontend run-backend run-frontend install clean format lint health-check test-backend test-e2e test-all benchmark

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
