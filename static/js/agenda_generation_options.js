var HasSubmittedMessage = false;
var UpActionType = 1;
var DownActionType = 2;

function convertBackendScheduleDictListToFrontendDictList(scheduleEvents) {
    // scheduleEvents is like:
    // '[{ "event_name": "会议开场",
    //     "child_events": [ { "event_name": "主持人开场白(介绍会议主要内容、及可能的议程改动)", 
    //                         "duration": 1,
    //                         "role": "主持人", 
    //                         "additional_fields": [{field_label: "xxx", 
    //                                                field_name: "xxx", 
    //                                                default_value: "xxx"} },
    //                       { "event_name": "介绍会议规则以及宾客介绍（限时每位30秒）",
    //                         "duration": 2,
    //                         "role": "礼宾师",
    //                         "additional_fields": [{field_label: "xxx", 
    //                                                field_name: "xxx",
    //                                                default_value: "xxx"} ] 
    //                       }
    //  ]';
    let convertedList = [];
    for (let i = 0; i < scheduleEvents.length; i++) {
        let convertedEvent = convertBackendScheduleDictToFrontendDict(scheduleEvents[i], i + 1);
        convertedList.push(convertedEvent);
    }
    return convertedList;
}

function convertBackendScheduleDictToFrontendDict(scheduleEvent, index) {
    let data = {
        Title: scheduleEvent.event_name,
        ChildSessions: []
    };

    if ("duration" in scheduleEvent) {
        data.Duration = scheduleEvent.duration;
    }

    if (scheduleEvent.child_events && Array.isArray(scheduleEvent.child_events)) {
        for (let i = 0; i < scheduleEvent.child_events.length; i++) {
            let childEvent = scheduleEvent.child_events[i];
            data.ChildSessions.push(childEvent);
        }
    }
    return data;
}

function fillRoleNameList(roleNameListText) {
    var roleListTextArea = $('#role_name_list');
    roleListTextArea.val(roleNameListText);
}

function fillMeetingInfo(meetingInfo) {
    $.each(meetingInfo, function(index, item) {
        var fieldId = '#' + item.field_name;

        if ($(fieldId).is('input[type="text"]')) {
            // If it's a text input, set the value
            $(fieldId).val(item.content);
        } else if ($(fieldId).is('textarea')) {
            // If it's a textarea, set the content
            $(fieldId).val(item.content);
        }
    });
}

function GetMeetingInfoAsDictList(){
    var meetingInfo = [];
    $('#meetingInfo .input-group input[type="text"], #meetingInfo .input-group textarea').each(function () {
        var fieldName = $(this).attr('name');
        var content = $(this).val();
        // Create a dictionary with 'field_name' and 'content' keys and their respective values
        var info = {
            'field_name': fieldName,
            'content': content
        };
        // Append the dictionary to the meetingInfo list
        meetingInfo.push(info);
    });
    return meetingInfo;
}

function IsAllInputsValid(){
    function GetUnfilledFieldsInMeetingInfo() {
        var unfilledFields = [];
        // Iterate through each input and textarea within the form-group
        $('#meetingInfo input[type="text"], #meetingInfo textarea').each(function () {
            if ($(this).val().trim() === '') {
                unfilledFields.push($(this).attr('placeholder') || $(this).attr('id'));
            }
        });
        return unfilledFields;
    }

    // function GetUnfilledFieldsInMeetingSession() {

    // }

    var unfilledFieldsInMeetingInfo = GetUnfilledFieldsInMeetingInfo();
    if (unfilledFieldsInMeetingInfo.length > 0) {
        var errorMessage = "以下字段没有填写: " + unfilledFieldsInMeetingInfo.join(', ');
        showFailureMessage(errorMessage);
        return false;
    }

    // var unfilledFieldsInMeetingSession = GetUnfilledFieldsInMeetingSession();
    // TODO: Check parent session and child session.
    // parent session should not empty, duration should be number.
    return true;
}

function showSuccessMessage(message) {
    // Pop a message to notify the user.
    $('#Submitted_Content').empty();
    $('#Submitted_Content').append('<div class="alert alert-success" role="alert">' + message + '</div>');
    $('#staticBackdrop').modal('show');

    // Close modal automatically
    window.setTimeout(function () {
        $("#staticBackdropClose").trigger("click");
        $("#staticBackdrop").modal('hide');
    }, 1500);
}

function showFailureMessage(message) {
    // Pop a message to notify the user.
    $('#Submitted_Content').empty();
    $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">' + message + '</div>');
    $('#staticBackdrop').modal('show');

    // Close modal automatically
    window.setTimeout(function () {
        $("#staticBackdropClose").trigger("click");
        $("#staticBackdrop").modal('hide');
    }, 1500);
}

$(document).ready(function () {
    $.ajax({
        url: './GetUserInputExample',
        type: 'GET',
        success: function (response) {
            fillMeetingInfo(response.user_input_example.meeting_info);
            fillRoleNameList(response.user_input_example.role_name_list);
            data = convertBackendScheduleDictListToFrontendDictList(response.user_input_example.agenda_content);
            for (let i = 0; i < data.length; i++) {
                CreateSessionElement(data[i]);
            }
        },
        error: function (error) {
            console.error('Error:', error);
        }
    });

    // Event listener for the submit button click
    $('#submitButton').click(function () {
        // Check the validness of all the input content.
        if(!IsAllInputsValid()){
            return;
        }

        MaskUtil.mask();

        // Create an object to store the form data
        var formData = {
            meeting_info: GetMeetingInfoAsDictList(),
            role_name_list: $('#role_name_list').val(),
            agenda_content: GetAgendaContentAsDictList() 
        };

        // Send the form data as JSON via a POST request
        $.ajax({
            type: 'POST',
            url: './generate_with_text_blocks',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function (response) {
                // Handle the response from the server
                console.log('Data sent successfully');
                console.log(response);

                //Shutdown shade
                MaskUtil.unmask();
                showSuccessMessage('议程表生成成功');

                HasSubmittedMessage = true;
            },
            error: function (error) {
                // Handle any errors that occur during the request
                console.error('Error:', error);

                MaskUtil.unmask();
                showFailureMessage(error.statusText);
            }
        });

    });
});

// Add JavaScript code to send a request to the Flask route when the button is clicked
document.getElementById("downloadExcel").addEventListener("click", function () {
    if (HasSubmittedMessage == false) {
        $('#Submitted_Content').empty();
        $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">请先生成议程表</div>');
        $('#staticBackdrop').modal('show');

        window.setTimeout(function () {
            // $("#staticBackdropClose").trigger("click");
            $("#staticBackdrop").modal('hide');
        }, 1500);
        return;
    }

    MaskUtil.mask();

    // Send a GET request to the '/export_image' route
    fetch('./download_excel', {
        method: 'GET'
    })
        .then(response => {
            if (response.ok) {
                // If the response is successful, trigger the download
                response.blob().then(blob => {
                    var url = window.URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = 'touma_club_agenda.xlsx'; // You can set the desired filename here
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);

                    MaskUtil.unmask();
                    showSuccessMessage("下载Excel版议程表成功");
                });
            }
            else {
                console.error("Failed to download EXCEL");

                MaskUtil.unmask();
                $('#Submitted_Content').empty();
                $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">下载Excel版议程表失败</div>');
                $('#staticBackdrop').modal('show');

                window.setTimeout(function () {
                    // $("#staticBackdropClose").trigger("click");
                    $("#staticBackdrop").modal('hide');
                }, 1500);
            }
        })
        .catch(error => {
            console.error("Error:", error);

            MaskUtil.unmask();
            $('#Submitted_Content').empty();
            $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">下载Excel版议程表失败</div>');
            $('#staticBackdrop').modal('show');

            window.setTimeout(function () {
                // $("#staticBackdropClose").trigger("click");
                $("#staticBackdrop").modal('hide');
            }, 1500);
        });
});

document.getElementById("downloadPdf").addEventListener("click", function () {
    if (HasSubmittedMessage == false) {
        $('#Submitted_Content').empty();
        $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">请先点击生成议程表</div>');
        $('#staticBackdrop').modal('show');

        window.setTimeout(function () {
            // $("#staticBackdropClose").trigger("click");
            $("#staticBackdrop").modal('hide');
        }, 1500);
        return;
    }

    MaskUtil.mask();

    // Send a GET request to the server to download the PDF
    fetch('./download_pdf', {
        method: 'GET'
    })
        .then(response => {
            if (response.ok) {
                // If the response is successful, trigger the download
                response.blob().then(blob => {
                    var url = window.URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = 'touma_club_agenda.pdf'; // You can set the desired filename here
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);

                    MaskUtil.unmask();
                    showSuccessMessage("下载PDF版议程表成功");
                });
            } else {
                console.error("Failed to download PDF");

                MaskUtil.unmask();
                $('#Submitted_Content').empty();
                $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">下载PDF版议程表失败</div>');
                $('#staticBackdrop').modal('show');

                window.setTimeout(function () {
                    // $("#staticBackdropClose").trigger("click");
                    $("#staticBackdrop").modal('hide');
                }, 1500);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            MaskUtil.unmask();
            $('#Submitted_Content').empty();
            $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">下载PDF版议程表失败</div>');
            $('#staticBackdrop').modal('show');

            window.setTimeout(function () {
                // $("#staticBackdropClose").trigger("click");
                $("#staticBackdrop").modal('hide');
            }, 1500);
        });
});

document.getElementById("previewPdf").addEventListener("click", function () {
    if (HasSubmittedMessage == false) {
        $('#Submitted_Content').empty();
        $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">请先点击生成议程表</div>');
        $('#staticBackdrop').modal('show');

        window.setTimeout(function () {
            // $("#staticBackdropClose").trigger("click");
            $("#staticBackdrop").modal('hide');
        }, 1500);
        return;
    }

    MaskUtil.mask();

    fetch('./download_pdf', {
        method: 'GET'
    })
        .then(response => {
            if (response.ok) {
                // If the response is successful, display the PDF in a new browser tab
                response.blob().then(blob => {
                    var url = window.URL.createObjectURL(blob);

                    // Open the PDF in a new browser tab
                    window.open(url, '_blank');

                    MaskUtil.unmask();
                    showSuccessMessage();
                    $('#Submitted_Content').empty("预览PDF版议程表成功");
                });
            } else {
                console.error("Failed to retrieve PDF");

                MaskUtil.unmask();
                $('#Submitted_Content').empty();
                $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">预览PDF版议程表失败</div>');
                $('#staticBackdrop').modal('show');

                window.setTimeout(function () {
                    // $("#staticBackdropClose").trigger("click");
                    $("#staticBackdrop").modal('hide');
                }, 1500);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            MaskUtil.unmask();
            $('#Submitted_Content').empty();
            $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">预览PDF版议程表失败</div>');
            $('#staticBackdrop').modal('show');

            window.setTimeout(function () {
                // $("#staticBackdropClose").trigger("click");
                $("#staticBackdrop").modal('hide');
            }, 1500);
        });
});

document.getElementById("downloadImage").addEventListener("click", function () {
    if (HasSubmittedMessage == false) {
        $('#Submitted_Content').empty();
        $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">请先点击生成议程表</div>');
        $('#staticBackdrop').modal('show');

        window.setTimeout(function () {
            // $("#staticBackdropClose").trigger("click");
            $("#staticBackdrop").modal('hide');
        }, 1500);
        return;
    }

    MaskUtil.mask();

    // Send a GET request to the server to download the PDF
    fetch('./export_image', {
        method: 'GET'
    })
        .then(response => {
            if (response.ok) {
                // If the response is successful, trigger the download
                response.blob().then(blob => {
                    var url = window.URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = 'touma_club_agenda.jpg'; // You can set the desired filename here
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);

                    MaskUtil.unmask();
                    showSuccessMessage();
                    $('#Submitted_Content').empty("下载图片议程表成功");
                });
            } else {
                console.error("Failed to download image");

                MaskUtil.unmask();
                $('#Submitted_Content').empty();
                $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">下载图片议程表失败</div>');
                $('#staticBackdrop').modal('show');

                window.setTimeout(function () {
                    $("#staticBackdrop").modal('hide');
                }, 1500);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            MaskUtil.unmask();
            $('#Submitted_Content').empty();
            $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">下载图片议程表失败</div>');
            $('#staticBackdrop').modal('show');

            window.setTimeout(function () {
                $("#staticBackdrop").modal('hide');
            }, 1500);
        });
});

document.getElementById("previewImage").addEventListener("click", function () {
    if (HasSubmittedMessage == false) {
        $('#Submitted_Content').empty();
        $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">请先点击生成议程表</div>');
        $('#staticBackdrop').modal('show');

        window.setTimeout(function () {
            // $("#staticBackdropClose").trigger("click");
            $("#staticBackdrop").modal('hide');
        }, 1500);
        return;
    }

    MaskUtil.mask();

    fetch('./export_image', {
        method: 'GET'
    })
        .then(response => {
            if (response.ok) {
                // If the response is successful, display the PDF in a new browser tab
                response.blob().then(blob => {
                    var url = window.URL.createObjectURL(blob);

                    // Open the PDF in a new browser tab
                    window.open(url, '_blank');

                    MaskUtil.unmask();
                    showSuccessMessage();
                    $('#Submitted_Content').empty("预览图片议程表成功");
                });
            } else {
                console.error("Failed to preview image");

                MaskUtil.unmask();
                $('#Submitted_Content').empty();
                $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">预览图片议程表失败</div>');
                $('#staticBackdrop').modal('show');

                window.setTimeout(function () {
                    // $("#staticBackdropClose").trigger("click");
                    $("#staticBackdrop").modal('hide');
                }, 1500);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            MaskUtil.unmask();
            $('#Submitted_Content').empty();
            $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">预览图片议程表失败</div>');
            $('#staticBackdrop').modal('show');

            window.setTimeout(function () {
                // $("#staticBackdropClose").trigger("click");
                $("#staticBackdrop").modal('hide');
            }, 1500);
        });
});

/**
* 说明：数据进行加载时的遮罩层，基于bootstrap的页面模态框做封装处理
* 使用方法:
* 开启:MaskUtil.mask();
* 关闭:MaskUtil.unmask();
*/
var MaskUtil = (function () {
    var $mask, $maskMsg;
    var defMsg = '正在生成，请稍等 . . .';
    function init() {
        if (!$mask) {
            $mask = $("<div id=\"myWaitingModal\" class=\"modal fade\" data-keyboard=\"false\" data-backdrop=\"static\" data-role=\"dialog\" " +
                "aria-labelledby=\"myWaitingModalLabel\" aria-hidden=\"true\">" +
                "<div id=\"loading\" class=\"loading\"><span class=\"spinner-border\" role=\"status\"></span>" +
                "<span>&nbsp;&nbsp;" + defMsg + "</span></div></div>").appendTo("body");
        }
    }
    return {
        mask: function () {
            init();
            $('#myWaitingModal').modal('show');
        }
        , unmask: function () {
            $('#myWaitingModal').modal('hide');
            $mask = null;
            $('#myWaitingModal').remove();
            $('.modal-backdrop').hide();
        }
    }
}());