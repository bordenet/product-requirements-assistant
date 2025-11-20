# Release v0.5.0 - Windows Backend Binary

**Release Date:** November 20, 2025

Pre-built Windows backend server for non-technical users.

## 📦 What's Included

**One file:** `prd-assistant-backend-v0.5.0-windows-amd64.exe` (7.9 MB)

Backend server that runs on port 8080.

## ⚠️ What You Need

**This is the backend server only** - you also need:

1. **Python 3.8+** - Download from [python.org](https://www.python.org/downloads/)
2. **This repository** - Clone or download as ZIP from GitHub
3. **Run the setup script** - `.\scripts\setup-windows.ps1` handles everything else

The setup script will install Streamlit and start both backend and frontend automatically.

## 🚀 How to Use

### Step 1: Install Python
Download and install Python 3.8+ from [python.org/downloads](https://www.python.org/downloads/)

### Step 2: Get the Repository
Clone or download this repository:
```bash
git clone https://github.com/bordenet/product-requirements-assistant.git
```
Or download as ZIP from GitHub and extract it.

### Step 3: Download This Binary
Download `prd-assistant-backend-v0.5.0-windows-amd64.exe` from this release.

### Step 4: Run Setup
Open PowerShell in the repository folder and run:
```powershell
.\scripts\setup-windows.ps1
```

The setup script will:
- Find and use the downloaded backend binary
- Install Python dependencies (Streamlit)
- Start both backend and frontend
- Open the app in your browser at http://localhost:8501

### Step 5: Start Creating PRDs!
The app is now running. Follow the 3-phase workflow to create product requirements documents.

## 🎯 Future Releases

- **Electron installer** - True one-click install (no Python needed)
- **Self-contained .exe** - Everything bundled in one file
- **macOS and Linux** - Native applications for all platforms

## 📄 License

MIT License
