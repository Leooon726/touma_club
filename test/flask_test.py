import unittest
import json, os
from unittest.mock import patch, Mock
from app import app
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
        # prepare data for test.
        def _create_simulated_form_data():
            with open('/home/lighthouse/touma_club/test/example_user_input.json', 'r') as file:
                json_content = json.load(file)
            return json_content

        with self.app.session_transaction() as session:
            session['selected_template'] = 'jabil_jouse_template_for_print'
        simulated_data = _create_simulated_form_data()

        response = self.app.post('/generate_with_text_blocks', json=simulated_data, follow_redirects=True)
        response_dict = json.loads(response.data)

        # Check if the response status code is 200, indicating success
        self.assertEqual(response.status_code, 200)

        # Check if the JSON file was created
        self.assertTrue(os.path.isfile(response_dict['user_input_file_path']))
        self.assertTrue(os.path.isfile(response_dict['output_excel_file_path']))

    def test_list_templates(self):
        response = self.app.post('/list_templates', data={'user_name': 'Test1111'})
        print('header1: ',response.headers)
        data_dict = json.loads(response.data)
        print('tested_list: ',data_dict['template_names'])

    def test_template_fields(self):
        data = {'selected_template':'jabil_jouse_template_for_print'}
        response = self.app.post('/template_fields', data=data, follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        decoded_response = response.data.decode('utf-8')
        data = json.loads(decoded_response)
        print(data)

    def test_export_pdf(self):
        # Simulate data.
        with self.app.session_transaction() as session:
            session['output_directory'] = '/home/lighthouse/touma_club/test'
            session['output_excel_file_path'] = '/home/lighthouse/touma_club/test/example_agenda.xlsx'

        # Test.
        response = self.app.get('/export_pdf', follow_redirects=True)
        print(response.data)

    def test_export_image(self):
        # Simulate data.
        with self.app.session_transaction() as session:
            session['output_directory'] = '/home/lighthouse/touma_club/test'
            session['output_excel_file_path'] = '/home/lighthouse/touma_club/test/example_agenda.xlsx'
            
        # Test.
        response = self.app.get('/export_image', follow_redirects=True)
        print(response.data)

if __name__ == '__main__':
    unittest.main()