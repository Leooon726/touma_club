import os
import subprocess
import json

_TEMPLATE_ZOO_PATH = '/home/lighthouse/agenda_template_zoo'
_PYTHON_PATH = '/home/lighthouse/.pyenv/shims/python3'

class AgendaGenerationAdaptor():
    _DEFAULT_ROLE_FIELDS = ['礼宾师','摄影师','会议经理','时间官','哼哈师','语法师','总体点评师','破冰师','主席','主持人','备稿演讲者','即兴主持人','即兴点评师','备稿点评师','下一期会议经理']
    
    def __init__(self):
        pass

    @staticmethod
    def _is_role_field(input_field):
        '''
        Returns True if the |input_field| is a role field.
        Example: '备稿演讲者1' -> True
        '会议主题' -> False
        '''
        for default_role_field in AgendaGenerationAdaptor._DEFAULT_ROLE_FIELDS:
            if input_field in default_role_field:
                return True
        return False

    @staticmethod
    def template_name_to_config_path(template_name):
        return os.path.join(_TEMPLATE_ZOO_PATH,template_name,'engine_config.yaml')

    @staticmethod
    def _reorganize_to_meeting_info_and_role_dict(fields_dict):
        meeting_info_and_role_dict = {'meeting_info':[],'role_name_list':[]}
        for field_and_example_dict in fields_dict:
            field = field_and_example_dict['field_name']
            example = field_and_example_dict['example'] if 'example' in field_and_example_dict else ''
            if not AgendaGenerationAdaptor._is_role_field(field):
                meeting_info_and_role_dict['meeting_info'].append({'field_name':field,'content':example})

        for default_role_field in AgendaGenerationAdaptor._DEFAULT_ROLE_FIELDS:
            field = default_role_field
            example = 'xxx'
            meeting_info_and_role_dict['role_name_list'].append({'role':field,'name':example})

        return meeting_info_and_role_dict

    @staticmethod
    def get_meeting_info_fields_dict(template_name,output_directory):
        '''
            Returns required user-input fields of meeting info and their examples.
        '''
        config_path = AgendaGenerationAdaptor.template_name_to_config_path(template_name)
        output_json_file_path = os.path.join(output_directory,'fields.json')
        command = f"{_PYTHON_PATH} /home/lighthouse/tm_meeting_assistant/get_template_fields_main.py -o {output_json_file_path} -c {config_path}"
        try:
            subprocess.run(command, shell=True, check=True)
        except subprocess.CalledProcessError as e:
            print("Error:", e)

        with open(output_json_file_path, "r", encoding="utf-8") as file:
            fields_dict = json.load(file, encoding="utf-8")
        # Split all the fields into meeting info dict and role dict.
        meeting_info_and_role_dict = AgendaGenerationAdaptor._reorganize_to_meeting_info_and_role_dict(fields_dict)
        return meeting_info_and_role_dict
        