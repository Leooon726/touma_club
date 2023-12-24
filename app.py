import sys,os
import logging
import subprocess
import yaml
import secrets
from datetime import datetime
import json

from flask import Flask, render_template, request,send_file,jsonify,session

from agenda_generation_adaptor import AgendaGenerationAdaptor
from agenda_history_manager import AgendaHistoryManager

# Set up logging
log_file = 'app.log'
logging.basicConfig(filename=log_file, level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__,static_folder='static',template_folder='templates')
app.secret_key = 'touma_club' # secrets.token_hex(16)
# Load configuration from YAML file
with open('/home/lighthouse/touma_club/app_config.yaml', 'r') as config_file:
    app.config.update(yaml.safe_load(config_file))


def _get_or_create_output_file_directory():
    if 'output_directory' in session and os.path.exists(session.get('output_directory')):
        return session.get('output_directory')
    # Create a filename that includes datetime and the token
    current_datetime = datetime.now().strftime("%Y%m%d%H%M%S")
    token = secrets.token_hex(2)[:3]
    folder_name = f"{current_datetime}_{token}"
    file_directory = os.path.join(app.config['output_files_directory'],folder_name)
    # Create the directory if it doesn't exist
    os.makedirs(file_directory, exist_ok=True)
    session['output_directory'] = file_directory
    return file_directory

@app.route('/')
@app.route('/SelectTemplates')
def select_template():
    # TODO(Changhong): also return options of templates.
    # return render_template('DownloadAgenda/SelectTemplates.html')
    return render_template('SelectTemplates.html')

@app.route('/InputAgendaContent')
def input_agenda_content():
    selected_template = session.get('selected_template')
    logger.debug(f"In InputAgendaContent, selected template: {selected_template}")
    output_directory = _get_or_create_output_file_directory()
    logger.debug(f"output_directory: {output_directory}")
    fields_dict = AgendaGenerationAdaptor.get_meeting_info_fields_dict(selected_template,output_directory)
    return render_template('InputAgendaContent.html',template_fields_dict=fields_dict)

@app.route('/GetAgendaHistory')
def get_agenda_history():
    selected_template = session.get('selected_template')
    agenda_history_dict = AgendaHistoryManager.get_agenda_history(selected_template)
    return jsonify(agenda_history_dict)

@app.route('/GetAgendaJsonContent')
def get_agenda_json_content():
    selected_agenda_title = request.args.get('selectedAgendaTitle')
    selected_template = session.get('selected_template')
    user_input_example_json = AgendaHistoryManager.get_agenda_json_content(selected_template, selected_agenda_title)
    return jsonify({'user_input_example': user_input_example_json})

@app.route('/set_selected_template', methods=['POST'])
def record_template():
    session['selected_template'] = request.form.get('selected_template')
    logger.debug(f"Set selected template: {session.get('selected_template')}")
    d = {'selected_template':session.get('selected_template')}
    return jsonify(data=d)
    

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


@app.route('/generate_with_json', methods=['POST'])
def generate_with_text_blocks():
    # Receive a post with json string, dump it into .json file.
    json_dict = request.get_json()

    file_directory = _get_or_create_output_file_directory()
    user_input_file_path = os.path.join(file_directory,'user_input_text_blocks.json')
    with open(user_input_file_path, 'w') as json_file:
        json.dump(json_dict, json_file, indent=4, ensure_ascii=False)
    logger.debug(f"Text blocks saved as {user_input_file_path}")
    session['input_json_file_path'] = user_input_file_path
    output_excel_file_path = os.path.join(file_directory, 'generated_agenda.xlsx')
    session['output_excel_file_path'] = output_excel_file_path

    response_data = {
        'user_input_file_path': user_input_file_path,
        'output_excel_file_path': output_excel_file_path,
        'message': '生成成功'
    }

    # TODO: support input .json file as input file.
    # TODO: make -c configable. use session['template_name'] to get the right engine_config.yaml
    engine_config_path = AgendaGenerationAdaptor.template_name_to_config_path(session.get('selected_template'))
    command = f"/home/lighthouse/.pyenv/shims/python3 /home/lighthouse/tm_meeting_assistant/main.py -i {user_input_file_path} -o {output_excel_file_path} -c {engine_config_path}"
    try:
        subprocess.run(command, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print("Error:", e)

    # If the agenda is regenerated, clear the stale pdf path to avoid generate image with the stale pdf file.
    if 'output_pdf_file_path' in session:
        session.pop('output_pdf_file_path')
    session.modified = True
    logger.debug(f"Generated excel in {output_excel_file_path}")

    return jsonify(response_data)

def _export_image():
    if ('output_pdf_file_path' not in session) or (not os.path.exists(session.get('output_pdf_file_path'))):
        logger.debug('output_pdf_file_path does not exist, generating pdf.')
        pdf_path = _export_pdf()
    else:
        logger.debug(f"output_pdf_file_path exists, at {session.get('output_pdf_file_path')}")
        pdf_path = session.get('output_pdf_file_path')

    output_image_file_path = os.path.join(session.get('output_directory'),'exported_agenda.jpg')
    command = [
        "convert",
        "-density", "300",
        "-quality", "100",
        "-units", "PixelsPerInch",
        "-flatten",
        pdf_path + "[0]", # Only convert the first page.
        output_image_file_path
    ]

    logger.debug(f"Executing command: {' '.join(command)}")  # Print the command being executed
    try:
        completed_process = subprocess.run(command, capture_output=True, text=True)
        if completed_process.returncode != 0:
            error_message = completed_process.stderr.strip()
            logger.error(f"Error occurred during command execution: {error_message}")
    except Exception as e:
        logger.error(f"An error occurred while executing the command: {str(e)}")

    logger.debug(f"Image created in {output_image_file_path}")
    return output_image_file_path

@app.route('/download_image', methods=['GET'])
def download_image():
    _save_input_json_to_history()
    output_image_file_path = _export_image()
    return send_file(output_image_file_path, as_attachment=True)

@app.route('/preview_image', methods=['GET'])
def preview_image():
    output_image_file_path = _export_image()
    return send_file(output_image_file_path, as_attachment=True)

def _export_pdf():
    input_excel_file_path = session.get('output_excel_file_path')
    output_pdf_file_path = input_excel_file_path.replace('xlsx','pdf')
    session['output_pdf_file_path'] = output_pdf_file_path

    # Run the unoconv command to convert the input Excel file to PDF
    convert_command = ['libreoffice','--convert-to','pdf','--outdir',session.get('output_directory'),input_excel_file_path]
    logger.debug(f"Executing command: {' '.join(convert_command)}")  # Print the command being executed

    try:
        completed_process = subprocess.run(convert_command, capture_output=True, text=True)
        if completed_process.returncode != 0:
            error_message = completed_process.stderr.strip()
            logger.error(f"Error occurred during command execution: {error_message}")
    except Exception as e:
        logger.error(f"An error occurred while executing the command: {str(e)}")

    logger.debug(f"PDF generated in {output_pdf_file_path}")
    return output_pdf_file_path

def _save_input_json_to_history():
    selected_template = session.get('selected_template')
    input_json_file_path = session.get('input_json_file_path')
    AgendaHistoryManager.add_file_to_history(selected_template,input_json_file_path)

@app.route('/download_excel', methods=['GET'])
def download_excel():
    _save_input_json_to_history()
    excel_file_path = session.get('output_excel_file_path')
    return send_file(excel_file_path, as_attachment=True)

@app.route('/download_pdf', methods=['GET'])
def download_pdf():
    _save_input_json_to_history()
    output_pdf_file_path = _export_pdf()
    return send_file(output_pdf_file_path, as_attachment=False)

@app.route('/preview_pdf', methods=['GET'])
def preview_pdf():
    output_pdf_file_path = _export_pdf()
    return send_file(output_pdf_file_path, as_attachment=False)

@app.route('/get_child_session_default_data', methods=['GET'])
def get_child_session_default_data():
    data = AgendaGenerationAdaptor.get_child_session_default_data_by_template_name(session['selected_template'])
    return data

if __name__ == '__main__':
    app.run(debug=True)