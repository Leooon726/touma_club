import unittest
import json, os
from unittest.mock import patch, Mock
from touma_club.app import app
import subprocess

class FlaskTest(unittest.TestCase):

    def setUp(self):
        app.config['TESTING'] = True
        self.app = app.test_client()

    def test_index_route(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)

    @patch('subprocess.run')
    def test_generate_route_successful_run(self, mock_subprocess):
        # Mock the subprocess.run function for a successful run
        mock_subprocess.return_value = Mock(returncode=0)

        response = self.app.post('/generate', data={'text_content': 'Test content'})
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Text saved successfully', response.data)

    @patch('subprocess.run')
    def test_generate_route_exception(self, mock_subprocess):
        # Mock the subprocess.run function to raise an exception
        mock_subprocess.side_effect = subprocess.CalledProcessError(returncode=1, cmd='mocked command')

        response = self.app.post('/generate', data={'text_content': 'Test content'})
        self.assertEqual(response.status_code, 200)  # Adjust this based on your actual error handling

    def test_generate_with_text_blocks(self):

        def _create_simulated_form_data():
            role_name_string = '''role name text'''

            meeting_info_string = '''meeting info text'''

            pathway_project_info_string = '''pathway project info text'''

            schedule_text_string = '''schedule text'''

            # Simulate a POST request with form data
            data = {
                'meeting_info': meeting_info_string,
                'role_name_list': role_name_string,
                'schedule_text': schedule_text_string,
                'pathway_project_info': pathway_project_info_string
            }
            return data

        data = _create_simulated_form_data()
        response = self.app.post('/generate_with_text_blocks', data=data, follow_redirects=True)
        data_dict = json.loads(response.data)

        # Check if the response status code is 200, indicating success
        self.assertEqual(response.status_code, 200)

        # Check if the JSON file was created
        self.assertTrue(os.path.isfile(data_dict['user_input_file_path']))

        # Load and validate the content of the JSON file
        with open(data_dict['user_input_file_path'], 'r') as file:
            json_content = json.load(file)
        self.assertEqual(json_content['meeting_info'], 'meeting info text')
        self.assertEqual(json_content['role_name_list'], 'role name text')
        self.assertEqual(json_content['schedule_text'], 'schedule text')
        self.assertEqual(json_content['pathway_project_info'], 'pathway project info text')

    # def test_download_route(self):
    #     response = self.app.get('/download')
    #     self.assertEqual(response.status_code, 200)
    #     self.assertEqual(response.headers['Content-Disposition'], 'attachment; filename=generated_agenda.xlsx')

if __name__ == '__main__':
    unittest.main()