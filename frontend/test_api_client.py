import unittest
from unittest.mock import Mock, patch

import requests

from api_client import APIClient


class APIClientTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = APIClient("http://backend")

    @patch("api_client.requests.post")
    def test_create_project_success(self, mock_post: Mock) -> None:
        response = Mock()
        response.raise_for_status.return_value = None
        response.json.return_value = {"id": "123"}
        mock_post.return_value = response

        result = self.client.create_project("title", "problems", "context")

        self.assertEqual(result["id"], "123")
        mock_post.assert_called_once()

    @patch("api_client.requests.post", side_effect=requests.exceptions.ConnectionError)
    def test_create_project_connection_error(
        self, mock_post: Mock
    ) -> None:  # noqa: ARG001
        with self.assertRaises(Exception) as ctx:
            self.client.create_project("title", "problems", "context")

        self.assertIn("Could not connect to backend server", str(ctx.exception))

    @patch("api_client.requests.post", side_effect=requests.exceptions.Timeout)
    def test_create_project_timeout(self, mock_post: Mock) -> None:  # noqa: ARG001
        with self.assertRaises(Exception) as ctx:
            self.client.create_project("title", "problems", "context")

        self.assertIn("Request timed out", str(ctx.exception))

    @patch("api_client.requests.get")
    def test_get_project_success(self, mock_get: Mock) -> None:
        response = Mock()
        response.raise_for_status.return_value = None
        response.json.return_value = {"id": "p1"}
        mock_get.return_value = response

        project = self.client.get_project("p1")

        self.assertEqual(project["id"], "p1")
        mock_get.assert_called_once()

    @patch("api_client.requests.get", side_effect=Exception("boom"))
    def test_get_project_generic_error_is_raised(
        self, mock_get: Mock
    ) -> None:  # noqa: ARG001
        with self.assertRaises(Exception):
            self.client.get_project("p1")

    @patch("api_client.requests.post")
    def test_update_phase_success(self, mock_post: Mock) -> None:
        response = Mock()
        response.raise_for_status.return_value = None
        response.json.return_value = {"phase": 1}
        mock_post.return_value = response

        result = self.client.update_phase("p1", 1, "content")

        self.assertEqual(result["phase"], 1)
        mock_post.assert_called_once()

    @patch("api_client.requests.post", side_effect=requests.exceptions.ConnectionError)
    def test_update_phase_connection_error(
        self, mock_post: Mock
    ) -> None:  # noqa: ARG001
        with self.assertRaises(Exception):
            self.client.update_phase("p1", 1, "content")

    @patch("api_client.requests.get")
    def test_list_projects_success_and_non_200(self, mock_get: Mock) -> None:
        ok_response = Mock(status_code=200)
        ok_response.json.return_value = [{"id": "p1"}]

        error_response = Mock(status_code=500)

        mock_get.side_effect = [ok_response, error_response]

        projects = self.client.list_projects()
        self.assertEqual(len(projects), 1)

        projects = self.client.list_projects()
        self.assertEqual(projects, [])

    @patch("api_client.requests.get", side_effect=requests.exceptions.Timeout)
    def test_list_projects_timeout_returns_empty(
        self, mock_get: Mock
    ) -> None:  # noqa: ARG001
        projects = self.client.list_projects()
        self.assertEqual(projects, [])

    @patch("api_client.requests.get")
    def test_get_prompt_success_and_non_200(self, mock_get: Mock) -> None:
        ok_response = Mock(status_code=200)
        ok_response.json.return_value = {"content": "prompt"}
        error_response = Mock(status_code=404)

        mock_get.side_effect = [ok_response, error_response]

        content = self.client.get_prompt("claude_initial")
        self.assertEqual(content, "prompt")

        content = self.client.get_prompt("claude_initial")
        self.assertEqual(content, "")

    @patch("api_client.requests.get", side_effect=requests.exceptions.ConnectionError)
    def test_get_prompt_connection_error_returns_empty(
        self, mock_get: Mock
    ) -> None:  # noqa: ARG001
        content = self.client.get_prompt("claude_initial")
        self.assertEqual(content, "")

    @patch("api_client.requests.post")
    def test_update_prompt_success_and_failure(self, mock_post: Mock) -> None:
        ok_response = Mock(status_code=200)
        error_response = Mock(status_code=500)

        mock_post.side_effect = [ok_response, error_response]

        self.assertTrue(self.client.update_prompt("phase", "content"))
        self.assertFalse(self.client.update_prompt("phase", "content"))

    @patch("api_client.requests.post", side_effect=requests.exceptions.Timeout)
    def test_update_prompt_timeout_returns_false(
        self, mock_post: Mock
    ) -> None:  # noqa: ARG001
        self.assertFalse(self.client.update_prompt("phase", "content"))


if __name__ == "__main__":
    unittest.main()
