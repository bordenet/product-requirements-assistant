.PHONY: all backend frontend run-backend run-frontend install clean

all: install

install:
	cd backend && go mod download
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

format:
	cd backend && go fmt ./...
	cd frontend && black *.py
