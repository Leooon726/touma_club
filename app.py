import sys,os
import logging
import subprocess
import yaml
import secrets
from datetime import datetime
import json

from flask import Flask, render_template, request,send_file,jsonify,session

from agenda_generation_adaptor import AgendaGenerationAdaptor

# Set up logging
log_file = 'app.log'
logging.basicConfig(filename=log_file, level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)
# Load configuration from YAML file
with open('/home/lighthouse/touma_club/app_config.yaml', 'r') as config_file:
    app.config.update(yaml.safe_load(config_file))


def _get_or_create_output_file_directory():
    if 'output_directory' in session:
        return session['output_directory']
    # Create a filename that includes datetime and the token
    current_datetime = datetime.now().strftime("%Y%m%d%H%M%S")
    token = secrets.token_hex(2)[:3]
    folder_name = f"{current_datetime}_{token}"
    file_directory = os.path.join(app.config['output_files_directory'],folder_name)
    # Create the directory if it doesn't exist
    os.makedirs(file_directory, exist_ok=True)
    session['output_directory'] = file_directory
    return file_directory


# @app.route('/')
# def index():
#     with open(app.config['user_input_txt_template_path'], 'r') as f:
#         default_text = f.read()
#     return render_template('index.html', default_text=default_text, message=None)

@app.route('/')
@app.route('/SelectTemplates')
def select_template():
    # TODO(Changhong): also return options of templates.
    return render_template('DownloadAgenda/SelectTemplates.html')


@app.route('/generate', methods=['POST'])
def save_text():
    text_content = request.form.get('text_content')
    if text_content:
        file_directory = _get_or_create_output_file_directory()

        user_input_file_path = os.path.join(file_directory,'user_input.txt')
        with open(user_input_file_path, 'w') as file:
            file.write(text_content)

        output_excel_file_path = os.path.join(file_directory, 'generated_agenda.xlsx')

        # TODO: make it configurable.
        command = f"/home/lighthouse/.pyenv/shims/python3 /home/lighthouse/tm_meeting_assistant/main.py -i {user_input_file_path} -o {output_excel_file_path} -c /home/lighthouse/agenda_template_zoo/huangpu_rise_template_for_print/engine_config.yaml"
        try:
            subprocess.run(command, shell=True, check=True)
        except subprocess.CalledProcessError as e:
            print("Error:", e)

        # return render_template('index.html', default_text=text_content, message='Text saved successfully.', excel_generated=excel_generated_link)
        return send_file(output_excel_file_path, as_attachment=True)
    else:
        return render_template('index.html', default_text='', message='生成失败')


@app.route('/template_fields', methods=['POST'])
def record_template():
    session['selected_template'] = request.form.get('selected_template')
    logger.debug(f"Selected template: {session['selected_template']}")
    
    output_directory = _get_or_create_output_file_directory()
    fields_dict = AgendaGenerationAdaptor.get_fields_dict(session['selected_template'],output_directory)
    return jsonify(fields_dict)


@app.route('/generate_with_text_blocks', methods=['POST'])
def generate_with_text_blocks():
    # Receive a post with json string, dump it into .json file.
    json_dict = request.get_json()

    file_directory = _get_or_create_output_file_directory()
    user_input_file_path = os.path.join(file_directory,'user_input.json')
    with open(user_input_file_path, 'w') as json_file:
        json.dump(json_dict, json_file, indent=4, ensure_ascii=False)
    output_excel_file_path = os.path.join(file_directory, 'generated_agenda.xlsx')

    response_data = {
        'user_input_file_path': user_input_file_path,
        'output_excel_file_path': output_excel_file_path,
        'message': '生成成功'
    }

    # TODO: support input .json file as input file.
    # TODO: make -c configable. use session['template_name'] to get the right engine_config.yaml
    engine_config_path = AgendaGenerationAdaptor.template_name_to_config_path(session['selected_template'])
    command = f"/home/lighthouse/.pyenv/shims/python3 /home/lighthouse/tm_meeting_assistant/main.py -i {user_input_file_path} -o {output_excel_file_path} -c {engine_config_path}"
    try:
        subprocess.run(command, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print("Error:", e)

    # return send_file(output_excel_file_path, as_attachment=True)
    return jsonify(response_data)


if __name__ == '__main__':
    app.run(debug=True)