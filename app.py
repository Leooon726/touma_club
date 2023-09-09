import sys,os
import logging
import subprocess
import yaml
import secrets
from datetime import datetime
import json

from flask import Flask, render_template, request,send_file,jsonify,session

# Set up logging
log_file = 'app.log'
logging.basicConfig(filename=log_file, level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Load configuration from YAML file
with open('/home/lighthouse/touma_club/app_config.yaml', 'r') as config_file:
    app.config.update(yaml.safe_load(config_file))

@app.route('/')
def index():
    with open(app.config['user_input_txt_template_path'], 'r') as f:
        default_text = f.read()
    return render_template('index.html', default_text=default_text, message=None)

@app.route('/SelectTemplates')
def select_template():
    return render_template('DownloadAgenda/SelectTemplates.html')

def _create_a_new_output_file_directory():
    # Create a filename that includes datetime and the token
    current_datetime = datetime.now().strftime("%Y%m%d%H%M%S")
    token = secrets.token_hex(2)[:3]
    folder_name = f"{current_datetime}_{token}"
    file_directory = os.path.join(app.config['output_files_directory'],folder_name)
    # Create the directory if it doesn't exist
    os.makedirs(file_directory, exist_ok=True)
    return file_directory

@app.route('/generate', methods=['POST'])
def save_text():
    text_content = request.form.get('text_content')
    if text_content:
        file_directory = _create_a_new_output_file_directory()

        user_input_file_path = os.path.join(file_directory,'user_input.txt')
        with open(user_input_file_path, 'w') as file:
            file.write(text_content)

        output_excel_file_path = os.path.join(file_directory, 'generated_agenda.xlsx')

        command = f"/home/lighthouse/.pyenv/shims/python3 /home/lighthouse/tm_meeting_assistant/main.py -i {user_input_file_path} -o {output_excel_file_path} -c /home/lighthouse/agenda_template_zoo/huangpu_rise_template_for_print/engine_config.yaml"
        try:
            subprocess.run(command, shell=True, check=True)
        except subprocess.CalledProcessError as e:
            print("Error:", e)

        # return render_template('index.html', default_text=text_content, message='Text saved successfully.', excel_generated=excel_generated_link)
        return send_file(output_excel_file_path, as_attachment=True)
    else:
        return render_template('index.html', default_text='', message='生成失败')

# @app.route('/select_template', methods=['POST'])
# def select_template():
#     # TODO: to be implemented.
#     session['template_name'] = request.form.get('template_name')


@app.route('/generate_with_text_blocks', methods=['POST'])
def generate_with_text_blocks():
    user_input_dict = {}
    user_input_dict['meeting_info'] = request.form.get('meeting_info')
    user_input_dict['role_name_list'] = request.form.get('role_name_list')
    user_input_dict['schedule_text'] = request.form.get('schedule_text')
    user_input_dict['pathway_project_info'] = request.form.get('pathway_project_info')

    # TODO: add detailed check and provide detailed failure causes.
    if not (user_input_dict['meeting_info'] and user_input_dict['role_name_list'] and user_input_dict['schedule_text']):
        return render_template('index.html', default_text='', message='生成失败')

    file_directory = _create_a_new_output_file_directory()
    user_input_file_path = os.path.join(file_directory,'user_input.json')
    with open(user_input_file_path, 'w') as json_file:
        json.dump(user_input_dict, json_file, indent=4)
    output_excel_file_path = os.path.join(file_directory, 'generated_agenda.xlsx')

    response_data = {
        'user_input_file_path': user_input_file_path,
        'output_excel_file_path': output_excel_file_path,
        'message': '生成成功'
    }

    # TODO: support input .json file as input file.
    # TODO: make -c configable. use session['template_name'] to get the right engine_config.yaml
    command = f"python3 /home/lighthouse/tm_meeting_assistant/main.py -i {user_input_file_path} -o {output_excel_file_path} -c /www/wwwroot/tmma_website/engine_config.yaml"
    try:
        subprocess.run(command, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print("Error:", e)

    # return send_file(output_excel_file_path, as_attachment=True)
    return jsonify(response_data)

# @app.route('/download')
# def download_file():
#     # TODO: change file_path as a variable.
#     file_path = '/home/lighthouse/touma_club/generated_agenda.xlsx'
#     return 

if __name__ == '__main__':
    app.run(debug=True)