import requests
import json
from typing import Dict, List, Optional

class APIClient:
    def __init__(self, base_url: str, timeout: int = 30):
        self.base_url = base_url
        self.timeout = timeout
        
    def create_project(self, title: str, problems: str, context: str) -> Dict:
        try:
            response = requests.post(
                f"{self.base_url}/api/projects",
                json={
                    "title": title,
                    "problems": problems,
                    "context": context
                },
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.ConnectionError:
            raise Exception("Could not connect to backend server. Please ensure it's running on port 8080.")
        except requests.exceptions.Timeout:
            raise Exception("Request timed out. The backend server may be overloaded.")
        except Exception as e:
            print(f"Error creating project: {e}")
            raise
    
    def get_project(self, project_id: str) -> Dict:
        try:
            response = requests.get(f"{self.base_url}/api/projects/{project_id}", timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.ConnectionError:
            raise Exception("Could not connect to backend server. Please ensure it's running on port 8080.")
        except requests.exceptions.Timeout:
            raise Exception("Request timed out. The backend server may be overloaded.")
        except Exception as e:
            print(f"Error getting project: {e}")
            raise
    
    def update_phase(self, project_id: str, phase: int, content: str) -> Dict:
        try:
            response = requests.post(
                f"{self.base_url}/api/projects/{project_id}/phase/{phase}",
                json={"content": content},
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.ConnectionError:
            raise Exception("Could not connect to backend server. Please ensure it's running on port 8080.")
        except requests.exceptions.Timeout:
            raise Exception("Request timed out. The backend server may be overloaded.")
        except Exception as e:
            print(f"Error updating phase: {e}")
            raise
    
    def list_projects(self) -> List[Dict]:
        try:
            response = requests.get(f"{self.base_url}/api/projects", timeout=self.timeout)
            if response.status_code == 200:
                return response.json()
            return []
        except requests.exceptions.ConnectionError:
            print("Could not connect to backend server. Please ensure it's running on port 8080.")
            return []
        except requests.exceptions.Timeout:
            print("Request timed out. The backend server may be overloaded.")
            return []
        except Exception as e:
            print(f"Error listing projects: {e}")
            return []
    
    def get_prompt(self, phase: str) -> str:
        try:
            response = requests.get(f"{self.base_url}/api/prompts/{phase}", timeout=self.timeout)
            if response.status_code == 200:
                return response.json().get('content', '')
            return ''
        except requests.exceptions.ConnectionError:
            print("Could not connect to backend server. Please ensure it's running on port 8080.")
            return ''
        except requests.exceptions.Timeout:
            print("Request timed out. The backend server may be overloaded.")
            return ''
        except Exception as e:
            print(f"Error getting prompt: {e}")
            return ''
    
    def update_prompt(self, phase: str, content: str) -> bool:
        try:
            response = requests.post(
                f"{self.base_url}/api/prompts/{phase}",
                json={"content": content},
                timeout=self.timeout
            )
            return response.status_code == 200
        except requests.exceptions.ConnectionError:
            print("Could not connect to backend server. Please ensure it's running on port 8080.")
            return False
        except requests.exceptions.Timeout:
            print("Request timed out. The backend server may be overloaded.")
            return False
        except Exception as e:
            print(f"Error updating prompt: {e}")
            return False
