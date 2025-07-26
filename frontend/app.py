import streamlit as st
import requests
import json
import time
import re
from datetime import datetime
from api_client import APIClient

# Initialize API client
api = APIClient("http://localhost:8080")

# Page config
st.set_page_config(
    page_title="Product Requirements Assistant",
    page_icon="📋",
    layout="wide"
)

# Initialize session state
if 'current_project' not in st.session_state:
    st.session_state.current_project = None
if 'phase' not in st.session_state:
    st.session_state.phase = 1

def main():
    st.title("📋 Product Requirements Assistant")
    st.markdown("Interactive Product Requirements Document creation with AI assistance")
    
    # Add a global tip about copying
    with st.expander("💡 Pro Tip: Preserving Formatting", expanded=False):
        st.info("""
        **To keep your markdown formatting intact:**
        - In Claude: Use the 'Copy' button at the bottom of responses
        - In Gemini: Look for a copy or 'view source' option
        - Don't select and copy rendered text - this loses bullet points, numbering, etc.
        - The preview pane will show you if formatting is preserved
        """)
    
    # Sidebar
    with st.sidebar:
        st.header("Navigation")
        
        if st.button("🆕 New Project"):
            st.session_state.current_project = None
            st.session_state.phase = 1
            
        if st.button("📝 Edit Prompts"):
            st.session_state.show_prompts = True
            
        st.divider()
        
        # Recent projects
        st.subheader("Recent Projects")
        projects = api.list_projects()
        for project in projects:
            if st.button(f"📄 {project['title']}", key=project['id']):
                st.session_state.current_project = project
                st.session_state.phase = project['phase']
    
    # Main content
    if hasattr(st.session_state, 'show_prompts') and st.session_state.show_prompts:
        show_prompt_editor()
    elif st.session_state.current_project is None:
        show_new_project_form()
    else:
        show_project_workflow()

def show_new_project_form():
    st.header("Create New PRD Project")
    
    with st.form("new_project"):
        title = st.text_input("Document Title", placeholder="e.g., AI Chat Widget Integration")
        problems = st.text_area("Problems to Address", 
                              placeholder="List the problems this feature will solve...",
                              height=150)
        context = st.text_area("Additional Context & Considerations",
                             placeholder="Any simplifications, constraints, or other context...",
                             height=150)
        
        submitted = st.form_submit_button("Start PRD Process")
        
        if submitted and title and problems:
            try:
                project = api.create_project(title, problems, context)
                st.session_state.current_project = project
                st.session_state.phase = 1
                st.success("Project created successfully!")
                time.sleep(1)
                st.rerun()
            except Exception as e:
                st.error(f"Error creating project: {str(e)}")

def show_project_workflow():
    project = st.session_state.current_project
    
    # Progress indicator
    completed_phases = sum(1 for phase in project['phases'] if phase.get('content'))
    progress = completed_phases / 3
    st.progress(progress)
    
    st.header(f"Project: {project['title']}")
    
    # Show project overview
    with st.expander("📊 Project Overview", expanded=True):
        col1, col2, col3 = st.columns(3)
        with col1:
            if project['phases'][0].get('content'):
                st.success("✅ Phase 1: Complete")
            else:
                st.info("⏳ Phase 1: Pending")
        with col2:
            if project['phases'][1].get('content'):
                st.success("✅ Phase 2: Complete")
            else:
                st.info("⏳ Phase 2: Pending")
        with col3:
            if project['phases'][2].get('content'):
                st.success("✅ Phase 3: Complete")
            else:
                st.info("⏳ Phase 3: Pending")
    
    # Tabs for phases
    tab1, tab2, tab3 = st.tabs(["Phase 1: Claude Initial", "Phase 2: Gemini Review", "Phase 3: Claude Compare"])
    
    with tab1:
        show_phase_1()
    
    with tab2:
        show_phase_2()
        
    with tab3:
        show_phase_3()

def show_phase_1():
    st.subheader("Phase 1: Initial PRD with Claude Opus 4")
    
    project = st.session_state.current_project
    phase_data = project['phases'][0]
    
    # Show saved content if it exists
    if phase_data.get('content'):
        with st.expander("✅ Saved Phase 1 Content", expanded=False):
            st.markdown(phase_data['content'])
            st.success("Phase 1 is complete!")
    
    # Show prompt
    with st.expander("📝 Prompt for Claude", expanded=not phase_data.get('content')):
        prompt_text = st.text_area(
            "Select all (Ctrl/Cmd+A) and copy (Ctrl/Cmd+C):",
            value=phase_data['prompt'],
            height=300,
            key="phase1_prompt_display"
        )
    
    st.info("1. Select all text in the box above (Ctrl/Cmd+A)\\n2. Copy it (Ctrl/Cmd+C)\\n3. Paste into Claude Opus 4\\n4. Engage in dialogue to refine the PRD\\n5. **IMPORTANT**: In Claude, use the 'Copy' button at the bottom of Claude's response to copy the raw markdown\\n6. Paste the result below")
    
    # Two-column layout for input and preview
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### 📝 Input")
        claude_response = st.text_area(
            "Paste Claude's PRD here (use Claude's Copy button to preserve formatting):", 
            value=phase_data.get('content', ''),
            height=600,
            key="phase1_content",
            help="Make sure to use Claude's 'Copy' button at the bottom of the response to copy raw markdown with formatting preserved"
        )
        
        # Check for HTML tags that indicate wrong copy method
        if claude_response and ('<input' in claude_response or '<checkbox' in claude_response or '<div' in claude_response):
            st.error("⚠️ HTML tags detected! You've copied rendered HTML instead of markdown. Please use Claude's Copy button to copy the raw markdown.")
    
    with col2:
        st.markdown("### 👁️ Preview")
        if claude_response:
            with st.container():
                # Clean up common HTML artifacts if present
                cleaned_content = claude_response
                if '<input' in cleaned_content:
                    st.warning("Note: HTML elements detected and won't render properly. Use Claude's Copy button next time.")
                    # Basic cleanup - remove input tags
                    import re
                    cleaned_content = re.sub(r'<input[^>]*>', '- [ ]', cleaned_content)
                st.markdown(cleaned_content)
        else:
            st.info("Preview will appear here as you type/paste")
    
    col1, col2, col3 = st.columns([1, 1, 3])
    with col1:
        if st.button("💾 Save Phase 1", type="primary"):
            if claude_response:
                try:
                    updated_project = api.update_phase(project['id'], 1, claude_response)
                    st.session_state.current_project = updated_project
                    st.success("Phase 1 saved! Ready for Gemini review.")
                    time.sleep(1)  # Brief pause to show success message
                    st.rerun()
                except Exception as e:
                    st.error(f"Error saving: {str(e)}")
            else:
                st.warning("Please paste Claude's response before saving")
    
    with col2:
        if phase_data.get('content'):
            if st.button("✏️ Edit Phase 1"):
                # This will reload with the content in the text area
                st.rerun()
    
    # Help section
    with st.expander("ℹ️ Formatting Help", expanded=False):
        st.markdown("""
        **To preserve markdown formatting when copying from Claude:**
        
        1. **Don't select and copy the rendered text** - this loses formatting
        2. **Instead, use Claude's 'Copy' button** at the bottom of its response
        3. This copies the raw markdown with all formatting intact
        
        **If you see HTML tags like `<input>` in your paste:**
        - You've copied the rendered HTML instead of markdown
        - Go back to Claude and use the Copy button
        - Or try right-clicking and "Copy as plain text"
        
        **Common markdown syntax:**
        - `# Heading 1`
        - `## Heading 2`  
        - `### Heading 3`
        - `**bold text**`
        - `* bullet point`
        - `1. numbered list`
        - `- [ ] checkbox`
        - `` `code` ``
        
        **The preview pane shows how your markdown will look when rendered.**
        """)

def show_phase_2():
    st.subheader("Phase 2: Gemini Pro 2.5 Review")
    
    project = st.session_state.current_project
    phase1_content = project['phases'][0].get('content', '')
    phase_data = project['phases'][1]
    
    if not phase1_content:
        st.warning("⚠️ Please complete Phase 1 first")
        return
    
    # Show saved content if it exists
    if phase_data.get('content'):
        with st.expander("✅ Saved Phase 2 Content", expanded=False):
            st.markdown(phase_data['content'])
            st.success("Phase 2 is complete!")
    
    # The prompt should already have Claude's content injected by the backend
    # when Phase 1 was saved, but let's ensure it's there for display
    prompt = phase_data.get('prompt', '')
    if '[PASTE CLAUDE\'S PRD HERE]' in prompt and phase1_content:
        prompt = prompt.replace("[PASTE CLAUDE'S PRD HERE]", phase1_content)
    
    with st.expander("📝 Prompt for Gemini", expanded=not phase_data.get('content')):
        prompt_text = st.text_area(
            "Select all (Ctrl/Cmd+A) and copy (Ctrl/Cmd+C):",
            value=prompt,
            height=400,
            key="phase2_prompt_display"
        )
    
    st.info("1. Select all text in the box above (Ctrl/Cmd+A)\\n2. Copy it (Ctrl/Cmd+C)\\n3. Paste into Gemini Pro 2.5 (free tier)\\n4. **IMPORTANT**: Copy Gemini's response as markdown (look for a copy option or copy the source)\\n5. Paste below")
    
    # Two-column layout for input and preview
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### 📝 Input")
        gemini_response = st.text_area(
            "Paste Gemini's refined PRD here:",
            value=phase_data.get('content', ''),
            height=600,
            key="phase2_content",
            help="Ensure you copy the raw markdown to preserve formatting"
        )
        
        # Check for HTML tags
        if gemini_response and ('<input' in gemini_response or '<checkbox' in gemini_response or '<div' in gemini_response):
            st.error("⚠️ HTML tags detected! Please copy the markdown source, not the rendered HTML.")
    
    with col2:
        st.markdown("### 👁️ Preview")
        if gemini_response:
            with st.container():
                # Clean up common HTML artifacts if present
                cleaned_content = gemini_response
                if '<input' in cleaned_content:
                    st.warning("Note: HTML elements detected. Copy markdown source next time.")
                    cleaned_content = re.sub(r'<input[^>]*>', '- [ ]', cleaned_content)
                st.markdown(cleaned_content)
        else:
            st.info("Preview will appear here as you type/paste")
    
    col1, col2, col3 = st.columns([1, 1, 3])
    with col1:
        if st.button("💾 Save Phase 2", type="primary"):
            if gemini_response:
                try:
                    updated_project = api.update_phase(project['id'], 2, gemini_response)
                    st.session_state.current_project = updated_project
                    st.success("Phase 2 saved! Ready for final comparison.")
                    time.sleep(1)  # Brief pause to show success message
                    st.rerun()
                except Exception as e:
                    st.error(f"Error saving: {str(e)}")
            else:
                st.warning("Please paste Gemini's response before saving")
    
    with col2:
        if phase_data.get('content'):
            if st.button("✏️ Edit Phase 2"):
                st.rerun()

def show_phase_3():
    st.subheader("Phase 3: Claude Comparison & Final PRD")
    
    project = st.session_state.current_project
    phase1_content = project['phases'][0].get('content', '')
    phase2_content = project['phases'][1].get('content', '')
    phase_data = project['phases'][2]
    
    if not phase1_content or not phase2_content:
        st.warning("⚠️ Please complete Phases 1 and 2 first")
        return
    
    # Show saved content if it exists
    if phase_data.get('content'):
        with st.expander("✅ Final PRD", expanded=True):
            st.markdown(phase_data['content'])
            st.success("Final PRD is complete!")
    
    # The prompt should already have both PRDs injected by the backend
    # when Phase 2 was saved, but let's ensure they're there for display
    prompt = phase_data.get('prompt', '')
    if '[PASTE ORIGINAL PRD HERE]' in prompt and phase1_content:
        prompt = prompt.replace("[PASTE ORIGINAL PRD HERE]", phase1_content)
    if '[PASTE GEMINI\'S VERSION HERE]' in prompt and phase2_content:
        prompt = prompt.replace("[PASTE GEMINI'S VERSION HERE]", phase2_content)
    
    with st.expander("📝 Prompt for Claude", expanded=not phase_data.get('content')):
        prompt_text = st.text_area(
            "Select all (Ctrl/Cmd+A) and copy (Ctrl/Cmd+C):",
            value=prompt,
            height=500,
            key="phase3_prompt_display"
        )
    
    st.info("1. Select all text in the box above (Ctrl/Cmd+A)\\n2. Copy it (Ctrl/Cmd+C)\\n3. Paste into Claude to compare both versions\\n4. Work with Claude to create the final PRD\\n5. **Use Claude's Copy button** to preserve formatting\\n6. Paste the final result below")
    
    # Two-column layout for input and preview
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### 📝 Input")
        final_prd = st.text_area(
            "Paste final PRD here:",
            value=phase_data.get('content', ''),
            height=600,
            key="phase3_content",
            help="Remember to use Claude's Copy button to preserve markdown formatting"
        )
        
        # Check for HTML tags
        if final_prd and ('<input' in final_prd or '<checkbox' in final_prd or '<div' in final_prd):
            st.error("⚠️ HTML tags detected! Please use Claude's Copy button to copy raw markdown.")
    
    with col2:
        st.markdown("### 👁️ Preview")
        if final_prd:
            with st.container():
                # Clean up common HTML artifacts if present
                cleaned_content = final_prd
                if '<input' in cleaned_content:
                    st.warning("Note: HTML elements detected. Use Claude's Copy button next time.")
                    cleaned_content = re.sub(r'<input[^>]*>', '- [ ]', cleaned_content)
                st.markdown(cleaned_content)
        else:
            st.info("Preview will appear here as you type/paste")
    
    col1, col2, col3, col4 = st.columns([1, 1, 1, 2])
    with col1:
        if st.button("💾 Save Final PRD", type="primary"):
            if final_prd:
                try:
                    updated_project = api.update_phase(project['id'], 3, final_prd)
                    st.session_state.current_project = updated_project
                    st.success("Final PRD saved!")
                    time.sleep(1)
                    st.rerun()
                except Exception as e:
                    st.error(f"Error saving: {str(e)}")
            else:
                st.warning("Please paste the final PRD before saving")
    
    with col2:
        if phase_data.get('content'):
            if st.button("✏️ Edit Final"):
                st.rerun()
    
    with col3:
        if phase_data.get('content'):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{project['title'].replace(' ', '_')}_{timestamp}.md"
            st.download_button(
                label="📥 Download PRD",
                data=phase_data['content'],
                file_name=filename,
                mime="text/markdown"
            )
    
    with col4:
        if phase_data.get('content'):
            # Generate comprehensive final PRD for download
            final_doc = f"# {project['title']}\\n\\n"
            final_doc += f"*Final PRD Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}*\\n\\n"
            final_doc += "## Table of Contents\\n\\n"
            final_doc += "1. [Final PRD](#final-prd)\\n"
            final_doc += "2. [Revision History](#revision-history)\\n"
            final_doc += "3. [Phase 1: Initial Claude PRD](#phase-1-initial-claude-prd)\\n"
            final_doc += "4. [Phase 2: Gemini Review](#phase-2-gemini-review)\\n\\n"
            final_doc += "---\\n\\n"
            final_doc += "## Final PRD\\n\\n"
            final_doc += phase_data['content'] + "\\n\\n"
            final_doc += "---\\n\\n"
            final_doc += "## Revision History\\n\\n"
            final_doc += "| Phase | Description |\\n"
            final_doc += "|-------|-------------|\\n"
            final_doc += f"| Phase 1 | {project['phases'][0]['name']} |\\n"
            final_doc += f"| Phase 2 | {project['phases'][1]['name']} |\\n"
            final_doc += f"| Phase 3 | {project['phases'][2]['name']} |\\n\\n"
            
            if project['phases'][0].get('content'):
                final_doc += "---\\n\\n"
                final_doc += "## Phase 1: Initial Claude PRD\\n\\n"
                final_doc += project['phases'][0]['content'] + "\\n\\n"
            
            if project['phases'][1].get('content'):
                final_doc += "---\\n\\n"
                final_doc += "## Phase 2: Gemini Review\\n\\n"
                final_doc += project['phases'][1]['content']
            
            filename_complete = f"{project['title'].replace(' ', '_')}_COMPLETE_{timestamp}.md"
            st.download_button(
                label="📦 Download Complete PRD Package",
                data=final_doc,
                file_name=filename_complete,
                mime="text/markdown",
                type="secondary"
            )

def show_prompt_editor():
    st.header("Edit Prompt Templates")
    
    tab1, tab2, tab3 = st.tabs(["Claude Initial", "Gemini Review", "Claude Compare"])
    
    prompts = {
        "claude_initial": "Phase 1: Initial PRD Creation",
        "gemini_review": "Phase 2: Gemini Review", 
        "claude_compare": "Phase 3: Comparison & Finalization"
    }
    
    for (key, title), tab in zip(prompts.items(), [tab1, tab2, tab3]):
        with tab:
            st.subheader(title)
            current_prompt = api.get_prompt(key)
            
            new_prompt = st.text_area(f"Edit {title} prompt:",
                                    value=current_prompt,
                                    height=400,
                                    key=f"edit_{key}")
            
            if st.button(f"Save {title} Template", key=f"save_{key}"):
                api.update_prompt(key, new_prompt)
                st.success(f"{title} template saved!")
    
    if st.button("← Back to Projects"):
        st.session_state.show_prompts = False
        st.rerun()

if __name__ == "__main__":
    main()
