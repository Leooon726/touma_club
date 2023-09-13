import os
import subprocess
import json

_TEMPLATE_ZOO_PATH = '/home/lighthouse/agenda_template_zoo'
_PYTHON_PATH = '/home/lighthouse/.pyenv/shims/python3'

class AgendaGenerationAdaptor():
    def __init__(self):
        pass

    @staticmethod
    def template_name_to_config_path(template_name):
        return os.path.join(_TEMPLATE_ZOO_PATH,template_name,'engine_config.yaml')

    @staticmethod
    def get_fields_dict(template_name,output_directory):
        config_path = AgendaGenerationAdaptor.template_name_to_config_path(template_name)
        output_json_file_path = os.path.join(output_directory,'fields.json')
        command = f"{_PYTHON_PATH} /home/lighthouse/tm_meeting_assistant/get_template_fields_main.py -o {output_json_file_path} -c {config_path}"
        try:
            subprocess.run(command, shell=True, check=True)
        except subprocess.CalledProcessError as e:
            print("Error:", e)

        with open(output_json_file_path, "r") as file:
            fields_dict = json.load(file)
        return fields_dict
        