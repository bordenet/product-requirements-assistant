import requests
import json
from typing import Dict, List, Optional

class APIClient:
    def __init__(self, base_url: str):
        self.base_url = base_url
        
    def create_project(self, title: str, problems: str, context: str) -> Dict:
        try:
            response = requests.post(
                f"{self.base_url}/api/projects",
                json={
                    "title": title,
                    "problems": problems,
                    "context": context
                }
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error creating project: {e}")
            raise
    
    def get_project(self, project_id: str) -> Dict:
        try:
            response = requests.get(f"{self.base_url}/api/projects/{project_id}")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error getting project: {e}")
            raise
    
    def update_phase(self, project_id: str, phase: int, content: str) -> Dict:
        try:
            response = requests.post(
                f"{self.base_url}/api/projects/{project_id}/phase/{phase}",
                json={"content": content}
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error updating phase: {e}")
            raise
    
    def list_projects(self) -> List[Dict]:
        try:
            response = requests.get(f"{self.base_url}/api/projects")
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            print(f"Error listing projects: {e}")
            return []
    
    def get_prompt(self, phase: str) -> str:
        try:
            response = requests.get(f"{self.base_url}/api/prompts/{phase}")
            if response.status_code == 200:
                return response.json().get('content', '')
            return ''
        except Exception as e:
            print(f"Error getting prompt: {e}")
            return ''
    
    def update_prompt(self, phase: str, content: str) -> bool:
        try:
            response = requests.post(
                f"{self.base_url}/api/prompts/{phase}",
                json={"content": content}
            )
            return response.status_code == 200
        except Exception as e:
            print(f"Error updating prompt: {e}")
            return False
