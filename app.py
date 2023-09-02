import sys,os

from flask import Flask, render_template, request, send_from_directory,send_file

import logging
import subprocess

# Set up logging
log_file = 'app.log'
logging.basicConfig(filename=log_file, level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)

@app.route('/')
def index():
    # TODO: do not use absolute path.
    with open('/home/lighthouse/touma_club/user_input_template.txt', 'r') as f:
        default_text = f.read()
    return render_template('index.html', default_text=default_text, message=None)

@app.route('/generate', methods=['POST'])
def save_text():
    text_content = request.form.get('text_content')
    if text_content:
        filename = 'real_user_input.txt'
        with open(filename, 'w') as file:
            file.write(text_content)
        user_input_file_path = os.path.join(app.root_path, filename)
        output_excel_file_path = os.path.join(app.root_path, 'generated_agenda.xlsx')

        command = f"python3 /home/lighthouse/tm_meeting_assistant/main.py -i {user_input_file_path} -o {output_excel_file_path} -c /www/wwwroot/tmma_website/engine_config.yaml"
        try:
            subprocess.run(command, shell=True, check=True)
        except subprocess.CalledProcessError as e:
            print("Error:", e)

        # return render_template('index.html', default_text=text_content, message='Text saved successfully.', excel_generated=excel_generated_link)
        return send_file(output_excel_file_path, as_attachment=True)
    else:
        return render_template('index.html', default_text='', message='No text to save.')

@app.route('/download')
def download_file():
    # TODO: change file_path as a variable.
    file_path = '/home/lighthouse/touma_club/generated_agenda.xlsx'
    return 

if __name__ == '__main__':
    app.run(debug=True)