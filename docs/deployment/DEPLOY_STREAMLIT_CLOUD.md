# Deploy to Streamlit Cloud (Quick Web Hosting)

## Overview

**Fastest way to get a web-hosted version** without CloudFront complexity.

**Timeline:** 1-2 hours  
**Cost:** Free (or $20/month for private apps)  
**URL:** `https://your-app.streamlit.app`

---

## Prerequisites

- GitHub account
- Streamlit Cloud account (free at https://streamlit.io/cloud)

---

## Step 1: Simplify the App (Remove Go Backend)

### Current Architecture
```
Streamlit (Python) → Go Backend → File System
```

### New Architecture
```
Streamlit (Python) → Session State → Browser Download/Upload
```

### Changes Needed

**1. Remove backend dependency:**
- Store projects in `st.session_state` (in-memory)
- Add download button to save projects as JSON
- Add upload button to restore projects

**2. Embed prompts in Python:**
- Move `prompts/*.txt` into Python constants
- Or load from GitHub raw URLs

**3. Simplify requirements.txt:**
```txt
streamlit==1.28.2
```

---

## Step 2: Create Streamlit-Only Version

Create `frontend/app_standalone.py`:

```python
import streamlit as st
import json
from datetime import datetime

# Embedded prompts (or load from GitHub)
PROMPTS = {
    "1": "Your Phase 1 prompt here...",
    "2": "Your Phase 2 prompt here...",
    "3": "Your Phase 3 prompt here..."
}

# Initialize session state
if 'projects' not in st.session_state:
    st.session_state.projects = []

def save_project_to_browser():
    """Download project as JSON"""
    project = st.session_state.current_project
    json_str = json.dumps(project, indent=2)
    st.download_button(
        label="💾 Download Project",
        data=json_str,
        file_name=f"{project['title']}.json",
        mime="application/json"
    )

def load_project_from_browser():
    """Upload project from JSON"""
    uploaded = st.file_uploader("📂 Upload Project", type=['json'])
    if uploaded:
        project = json.loads(uploaded.read())
        st.session_state.projects.append(project)
        st.success("Project loaded!")

# Rest of your Streamlit app...
```

---

## Step 3: Deploy to Streamlit Cloud

### 3.1 Push to GitHub

```bash
# Create a new branch for web version
git checkout -b streamlit-cloud

# Commit changes
git add frontend/app_standalone.py
git commit -m "feat: add Streamlit Cloud standalone version"
git push origin streamlit-cloud
```

### 3.2 Deploy on Streamlit Cloud

1. Go to https://share.streamlit.io
2. Click "New app"
3. Connect your GitHub repo
4. Configure:
   - **Repository:** `bordenet/product-requirements-assistant`
   - **Branch:** `streamlit-cloud`
   - **Main file path:** `frontend/app_standalone.py`
   - **Python version:** 3.11
5. Click "Deploy"

### 3.3 Wait for Deployment

- Takes 2-5 minutes
- You'll get a URL like: `https://prd-assistant.streamlit.app`

---

## Step 4: Share with Users

Your app is now live at:
```
https://your-app-name.streamlit.app
```

**Features:**
- ✅ Works in any browser
- ✅ No installation required
- ✅ HTTPS included
- ✅ Free hosting
- ✅ Auto-deploys on git push

**Limitations:**
- ⚠️ Projects stored in browser session (lost on refresh)
- ⚠️ Users must download/upload JSON to persist
- ⚠️ Public by default (upgrade for password protection)
- ⚠️ 1GB RAM limit

---

## Step 5: Add Persistence (Optional)

### Option A: Browser LocalStorage (Free)

Use `streamlit-local-storage` package:

```python
from streamlit_local_storage import LocalStorage

ls = LocalStorage()
ls.setItem("projects", json.dumps(projects))
projects = json.loads(ls.getItem("projects") or "[]")
```

### Option B: Google Sheets (Free)

Use `gspread` to store projects:

```python
import gspread
from oauth2client.service_account import ServiceAccountCredentials

# Store projects in Google Sheets
# Users can view/edit in spreadsheet
```

### Option C: Supabase (Free Tier)

Use Supabase for PostgreSQL storage:

```python
from supabase import create_client

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
supabase.table('projects').insert(project).execute()
```

---

## Step 6: Add Authentication (Optional)

### Streamlit Built-in Auth

```python
import streamlit_authenticator as stauth

authenticator = stauth.Authenticate(
    credentials,
    'prd_assistant',
    'auth_key',
    cookie_expiry_days=30
)

name, authentication_status, username = authenticator.login('Login', 'main')

if authentication_status:
    st.write(f'Welcome {name}')
    # Show app
elif authentication_status == False:
    st.error('Username/password is incorrect')
```

---

## Comparison: Streamlit Cloud vs CloudFront

| Feature | Streamlit Cloud | CloudFront + Lambda |
|---------|----------------|---------------------|
| **Setup Time** | 2 hours | 2-3 weeks |
| **Cost** | Free - $20/month | $10-50/month |
| **Custom Domain** | $20/month | Included |
| **Scalability** | 1GB RAM limit | Unlimited |
| **Persistence** | Add-on required | Built-in (DynamoDB) |
| **Auth** | Add-on required | Cognito |
| **Complexity** | ⭐ Easy | ⭐⭐⭐ Hard |

---

## Recommendation

**For quick web hosting:**
→ Use Streamlit Cloud (this guide)

**For production CloudFront:**
→ See [CLOUDFRONT_HOSTING.md](CLOUDFRONT_HOSTING.md)

---

## Next Steps

1. **Try Streamlit Cloud first** (2 hours)
2. **Get user feedback**
3. **If successful**, migrate to CloudFront later
4. **If not needed**, keep Streamlit Cloud

Would you like me to create the standalone version now?

