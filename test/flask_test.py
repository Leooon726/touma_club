import unittest
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

    def test_download_route(self):
        response = self.app.get('/download')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['Content-Disposition'], 'attachment; filename=generated_agenda.xlsx')

if __name__ == '__main__':
    unittest.main()