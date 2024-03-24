import os
import json
import shutil


_AGENDA_HISTORY_PATH = '/home/lighthouse/agenda_history'
_HISTORY_MEETING_TITLE_FIELD_LIST = ['会议标题', '本期主题']
_HISTORY_MEETING_DATE_FIELD_LIST = ['会议日期', '日期']

class AgendaHistoryManager():
    def __init__():
        pass

    @staticmethod
    def get_agenda_json_content(template_name, agenda_title):
        agenda_json_file_path = os.path.join(_AGENDA_HISTORY_PATH,template_name,f"{agenda_title}.json")
        with open(agenda_json_file_path, 'r') as file:
            agenda_json = json.load(file)
        return agenda_json

    @staticmethod
    def get_agenda_history(template_name):
        '''Gets all the .json file in agenda_history_dir, and sorts them in descending order and saves in a list.
        '''
        agenda_history_dir = os.path.join(_AGENDA_HISTORY_PATH,template_name)
        files = [f for f in os.listdir(agenda_history_dir) if f.endswith('.json')]
        # Sort files in descending order based on modification time
        agenda_file_name_list = sorted(files, key=lambda x: os.path.getmtime(os.path.join(agenda_history_dir, x)), reverse=True)
        agenda_title_list = [os.path.splitext(agenda_file_name)[0] for agenda_file_name in agenda_file_name_list]
        if len(agenda_title_list)==0:
            return None
        return {'agenda_title_list': agenda_title_list, 'default_agenda_title': agenda_title_list[0]}

    @staticmethod
    def add_file_to_history(template_name,json_file_path):
        '''Copys the file in json_file_path into agenda_history_dir, if the file already exists, overwrite it.'''
        def _find_dict_with_key(list_of_dict, key, value_list):
            for value in value_list:
                for d in list_of_dict:
                    if key in d and d[key] == value:
                        return d
            return None

        agenda_history_dir = os.path.join(_AGENDA_HISTORY_PATH,template_name)
        if not os.path.exists(agenda_history_dir):
            os.makedirs(agenda_history_dir)

        # Load the json and get 日期 and 会议标题.
        with open(json_file_path, 'r') as file:
            json_data = json.load(file)
            title = _find_dict_with_key(json_data['meeting_info'], 'field_name', _HISTORY_MEETING_TITLE_FIELD_LIST)
            date = _find_dict_with_key(json_data['meeting_info'], 'field_name', _HISTORY_MEETING_DATE_FIELD_LIST)

        if date and title:
            new_filename = f"{date['content']}_{title['content']}.json"
            new_filepath = os.path.join(agenda_history_dir, new_filename)
            shutil.copy(json_file_path, new_filepath)
        else:
            assert False, "Date and title not found in JSON file."
