function CreateSessionElement(data) {
    let NewSessionID = "Session_";  //Get Session ID
    if (jQuery.isEmptyObject(data)) {
        //Get New Session Index
        let MeetingSessions_Count = $("#MeetingSession").children().length; //Get Current Sessions Length
        let NewSessionIndex = MeetingSessions_Count + 1;
        NewSessionID += NewSessionIndex;

        data = { Index: NewSessionIndex, Title: "", ChildSessions: [] };
    }
    else
        NewSessionID += data.Index;

    let Input_SessionName = $("<input />");
    Input_SessionName.attr("type", "text");
    Input_SessionName.attr("id", "parentSessionName");
    Input_SessionName.addClass("form-control");
    if (data.Title === "")
        Input_SessionName.attr("placeholder", "环节名称");
    else
        Input_SessionName.attr("value", data.Title);

    let Input_SessionDuration = $("<input />");
    Input_SessionDuration.attr("type", "text");
    Input_SessionDuration.attr("id", "parentSessionDuration");
    Input_SessionDuration.addClass("form-control");
    if (!("Duration" in data))
        Input_SessionDuration.attr("placeholder", "时长");
    else
        Input_SessionDuration.attr("value", data.Duration);

    //Add Operational Button
    let Button_ChildSession_Add = GetButtonDom("info", "+", "AddChildSession");
    let Button_Session_Up = GetButtonDom("primary", "▲", "SessionUp");
    let Button_Session_Down = GetButtonDom("warning", "▼", "SessionDown");
    let Button_Session_Del = GetButtonDom("danger", "x", "SessionDel");

    let DivRow_InputGroup = GetDivDom();
    DivRow_InputGroup.addClass("input-group mb-3");
    Input_SessionName.appendTo(DivRow_InputGroup);
    Input_SessionDuration.appendTo(DivRow_InputGroup);
    Button_ChildSession_Add.appendTo(DivRow_InputGroup);
    Button_Session_Up.appendTo(DivRow_InputGroup);
    Button_Session_Down.appendTo(DivRow_InputGroup);
    Button_Session_Del.appendTo(DivRow_InputGroup);

    ChildSessionsTable = createChildSessionsAsTable(data)

    //Add Container
    let DivContainer = GetDivDom();
    DivContainer.addClass("parent-and-children-session"); //container-fluid
    // DivRow_Title.appendTo(DivContainer);
    DivRow_InputGroup.appendTo(DivContainer);
    ChildSessionsTable.appendTo(DivContainer);

    let DivFormItem = $("#MeetingSession");
    DivContainer.appendTo(DivFormItem);
}

function createChildSessionsAsTable(data) {
    let Table = $("<table></table>");
    Table.addClass("table table-success table-bordered table-striped");
    Table.attr("id", "childSessionsTable");

    // Add tbody
    let tbodyDom = $("<tbody></tbody>");
    if (data.ChildSessions && data.ChildSessions.length > 0) {
        for (let i = 0; i < data.ChildSessions.length; i++) {
            let tbtrDom = CreateChildSessionElement(data.ChildSessions[i]);
            tbtrDom.appendTo(tbodyDom);
        }
    }
    tbodyDom.appendTo(Table);

    return Table;
}

function CreateSubTableInChildSession(data) {
    // Create the sub-table
    let subContentTable = $("<table></table>");
    subContentTable.attr("id", "childsessionFieldsTable");

    // Children Session Name
    let ChildSession_Name = $("<input type=\"text\" class=\"form-control\" />");
    ChildSession_Name.attr("id", "event_name");
    let nameLabel = $("<label>议程</label>"); // Add label
    if (data.Name == "")
        ChildSession_Name.attr("placeholder", "请输入子环节名称");
    else
        ChildSession_Name.attr("value", data.Name);

    let row1 = $("<tr></tr>");
    let labelCell = $("<td></td>").append(nameLabel);
    let inputCell = $("<td></td>").append(ChildSession_Name);
    row1.append(labelCell, inputCell);
    row1.appendTo(subContentTable);

    // Children Session Duration
    let durationLabel = $("<label>时长</label>"); // Add label
    let ChildSession_Duration = $("<input type=\"text\" class=\"form-control\" />");
    ChildSession_Duration.attr("id", "duration");
    if (data.Duration == "")
        ChildSession_Duration.attr("placeholder", "请输入子环节时长");
    else
        ChildSession_Duration.attr("value", data.Duration);
    let row2 = $("<tr></tr>");
    $("<td></td>").append(durationLabel).appendTo(row2);
    $("<td></td>").append(ChildSession_Duration).appendTo(row2);
    row2.appendTo(subContentTable);

    // Children Session Role
    let roleSelectLabel = $("<label>角色</label>"); // Add label
    let ChildSession_Role = GetRoleSelect(data.Role);
    ChildSession_Role.attr("id", "role");
    let row3 = $("<tr></tr>");
    $("<td></td>").append(roleSelectLabel).appendTo(row3);
    $("<td></td>").append(ChildSession_Role).appendTo(row3);
    row3.appendTo(subContentTable);
    return subContentTable;
}

function CreateChildSessionActionButtonGroup() {
    let btn_Child_Up = GetButtonDom("primary", "▲", "ChildSessionUp");
    let btn_Child_Down = GetButtonDom("warning", "▼", "ChildSessionDown");
    let btn_Child_Del = GetButtonDom("danger", "×", "ChildSessionDel");

    let Center_Btn = $("<center></center>");
    Center_Btn.append(btn_Child_Up);
    Center_Btn.append(btn_Child_Down);
    Center_Btn.append(btn_Child_Del);
    return Center_Btn;
}

function CreateChildSessionElement(data) {
    if (jQuery.isEmptyObject(data)) {
        data = { ChildIndex: 0, Name: "", Duration: 0, Role: "" };
    }

    let subContentTable = CreateSubTableInChildSession(data);

    //Children Session Operation
    let Center_Btn = CreateChildSessionActionButtonGroup();

    let TD_Btn = $("<td></td>");
    TD_Btn.append(Center_Btn);

    let tbtrDom = $("<tr></tr>");
    subContentTable.appendTo(tbtrDom)
    TD_Btn.appendTo(tbtrDom);

    return tbtrDom;
}

function GetDivDom() {
    let div = $("<div></div>");
    return div;
}


// Add Meeting Session
document.getElementById("MeetingSession_Add").addEventListener("click", function () {
    CreateSessionElement();
})

function GetButtonDom(color, name, classNameForClick) {
    let button = $("<button></button>");
    button.attr("type", "button");
    // button.attr("id", ID);

    let className = "btn btn-" + color + " " + classNameForClick;
    button.addClass(className);
    button.text(name);

    return button;
}

//Get Role Select
function GetRoleSelect(SelectedRole) {
    let RoleData = $("#role_name_list").text();
    // console.log(RoleData);

    let SelectDom = $("<select class=\"form-control\"></select>");
    let OptionsDom_Default = $("<option value=\"\">请选择角色</option>");
    OptionsDom_Default.appendTo(SelectDom);

    //Split Role Message
    let RoleArr = RoleData.split(/[(\r\n)\r\n]+/);
    for (let r = 0; r < RoleArr.length; r++) {
        if (RoleArr[r] != "") {
            let role = $.trim(RoleArr[r].split(':')[0]);
            let OptionStr_Role = "<option value=\"" + role + "\"";
            if (role == SelectedRole)
                OptionStr_Role += " selected"
            OptionStr_Role += ">" + role + "</option>";

            let OptionDom_Role = $(OptionStr_Role);
            OptionDom_Role.appendTo(SelectDom);
        }
    }

    return SelectDom;
}

function GetAgendaContentAsDictList() {
    function ParseChildSession(sessionRow) {
        let childsessionFieldsTable = $(sessionRow).find("#childsessionFieldsTable");
        let fieldData = {};

        childsessionFieldsTable.find("tr").each(function (index, fieldRow) {
            let fieldObject = $(fieldRow).find("input.form-control, select.form-control");
            let fieldName = fieldObject.attr("id");
            let fieldContent = fieldObject.val();

            // Save fieldName as key and fieldContent as value in the dictionary
            fieldData[fieldName] = fieldContent;
        });

        return fieldData;
    }

    function ParseChildSessions(parentSession) {
        let childSessionList = [];
        // Every child session has event_name, duration and role.
        let childSessionsTable = $(parentSession).find("#childSessionsTable");
        childSessionsTable.children("tbody").children("tr").each(function (index, sessionRow) {
            let session_dict = ParseChildSession(sessionRow);
            childSessionList.push(session_dict);
        });
        return childSessionList;
    }

    let agendaContentList = [];
    let DivDom = $("#MeetingSession");
    DivDom.children().each(function (index, parentSession) {
        var parentSessionName = $(parentSession).find("#parentSessionName");
        var parentSessionDuration = $(parentSession).find("#parentSessionDuration");
        var parentSessionContentDict = {
            event_name: parentSessionName.val()
        };
        if (parentSessionDuration.val() != "") {
            parentSessionContentDict["duration"] = parentSessionDuration.val()
        }
        let childSessionList = ParseChildSessions(parentSession);
        if (childSessionList.length !== 0) {
            parentSessionContentDict["child_events"] = childSessionList;
        }
        agendaContentList.push(parentSessionContentDict);
    });
    // console.log(agendaContentList);
    return agendaContentList;
}

function GetAgendaContent() {
    let DivDom = $("#MeetingSession");

    let AgendaContent = "";
    for (let i = 0; i < DivDom.children().length; i++) {
        let SessionData = GetSessionData(i, i + 1);
        AgendaContent += "# " + SessionData.Title + "\r\n";

        for (let j = 0; j < SessionData.ChildSessions.length; j++) {
            let ChildSessioinData = SessionData.ChildSessions[j];
            let ChildSessionContent = ChildSessioinData.Name + " " + ChildSessioinData.Duration + " " + ChildSessioinData.Role + "\r\n";
            AgendaContent += ChildSessionContent;
        }

        AgendaContent += "\r\n";
    }
    return AgendaContent;
}

$(document).on('click', ".AddChildSession", function () {
    let CurrSession = getCurrentSessionFromOperationButton($(this));
    let childSessionsTable = $(CurrSession).find("#childSessionsTable");

    // TODO: deprecate ChildIndex.
    let NewChildSessionData = { ChildIndex: 0, Name: "", Duration: 0, Role: "" };
    let NewChildSession = CreateChildSessionElement(NewChildSessionData);
    childSessionsTable.append(NewChildSession);
})

function getCurrentSessionFromOperationButton(button) {
    return $(button).parent().parent();
}

// bind Session Up Method
$(document).on('click', '.SessionUp', function () {
    let CurrSession = getCurrentSessionFromOperationButton($(this));
    let MeetingSessions = $("#MeetingSession");
    let CurrSessionIndex = MeetingSessions.children().index(CurrSession);
    // Check the index
    if (CurrSessionIndex == 0) {
        $('#Submitted_Content').empty();
        $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">已经是第一位，无法上移</div>');
        $('#staticBackdrop').modal('show');

        window.setTimeout(function () {
            // $("#staticBackdropClose").trigger("click");
            $("#staticBackdrop").modal('hide');
        }, 1500);
    }
    else {
        let previousSession = MeetingSessions.children().eq(CurrSessionIndex - 1);
        CurrSession.insertBefore(previousSession);

        // SessionMove(index, 1)
    }


})

$(document).on('click', '.SessionDown', function () {
    let CurrSession = $(this).parent().parent()
    let MeetingSessions = $("#MeetingSession");
    let CurrSessionIndex = MeetingSessions.children().index(CurrSession);
    let SessionsCount = MeetingSessions.children().length;
    if (CurrSessionIndex == SessionsCount - 1) {
        $('#Submitted_Content').empty();
        $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">已经是最后一位，无法下移</div>');
        $('#staticBackdrop').modal('show');

        window.setTimeout(function () {
            // $("#staticBackdropClose").trigger("click");
            $("#staticBackdrop").modal('hide');
        }, 1500);
    }
    else {
        let nextSession = MeetingSessions.children().eq(CurrSessionIndex + 1);
        CurrSession.insertAfter(nextSession);
        // SessionMove(index, -1)
    }
})

$(document).on('click', '.SessionDel', function () {
    let CurrSession = $(this).parent().parent()
    CurrSession.remove();
    // let index = parseInt($(this).parent().children().eq(0).text());
    // let SessionsCount = $("#MeetingSession").children().length;
    // if (index < SessionsCount) {
    //     console.log("Down the Session")
    //     SessionMove(index, index - SessionsCount);
    // }

    // //删除最后一个子元素
    // $("#MeetingSession").children().last().remove();
})

function SessionMove(CurrIndex, span) {
    let rowIndex = GetTableRowIndex(CurrIndex, UpActionType);
    let BeginSession = GetSessionData(rowIndex, CurrIndex - span);
    if (span > 0) {
        for (let i = 0; i <= span; i++) {
            if (i < span) {
                let MovingSession = GetSessionData(GetTableRowIndex(CurrIndex - i - 1, UpActionType), CurrIndex - i);
                RenderSession(MovingSession);
            }
            else {
                RenderSession(BeginSession);
            }

        }
    }
    else if (span < 0) {
        for (let i = 0; i >= span; i--) {
            if (i > span) {
                let MovingSession = GetSessionData(GetTableRowIndex(CurrIndex - i - 1, DownActionType), CurrIndex - i);
                RenderSession(MovingSession);
            }
            else {
                RenderSession(BeginSession);
            }
        }
    }


}

function GetSessionData(CurrIndex, NewIndex) {

    let SessionsDom = $("#MeetingSession").children().eq(CurrIndex);
    let SessionName = SessionsDom.children().eq(0).children().eq(1).val();

    let childSessionsArr = [];
    let tbodyDom = SessionsDom.children().eq(1).children().eq(1);
    for (let i = 0; i < tbodyDom.children().length; i++) {
        let trDom = tbodyDom.children().eq(i);
        let childSessionIndex = trDom.children().eq(0).text();
        let childSessionName = trDom.children().eq(1).children().val().trim();
        let childSessionDuration = trDom.children().eq(2).children().val().trim();
        let childSessionRole = trDom.children().eq(3).children().val().trim();

        let ChildSessionData = { ChildIndex: childSessionIndex, Name: childSessionName, Duration: childSessionDuration, Role: childSessionRole };
        childSessionsArr.push(ChildSessionData);
    }

    let data = { Index: NewIndex, Title: SessionName, ChildSessions: childSessionsArr };
    return data;
}

function RenderSession(SessionData) {
    let SessionsDom = $("#MeetingSession").children().eq(SessionData.Index - 1);
    SessionsDom.children().eq(0).children().eq(1).val(SessionData.Title);

    let tbodyDom = SessionsDom.children().eq(1).children().eq(1);
    tbodyDom.empty();

    for (let i = 0; i < SessionData.ChildSessions.length; i++) {
        let tbodyTrDom = CreateChildSessionElement(SessionData.ChildSessions[i]);
        tbodyDom.append(tbodyTrDom);
    }
}

function GetTableRowIndex(CurrIndex, Type) {
    //up action use -1; down action use 1
    let RowIndex = Type == 1 ? CurrIndex - 1 : CurrIndex + 1;
    return RowIndex;
}


$(document).on('click', '.ChildSessionUp', function () {
    let ChildSessioTbodyDom = $(this).parent().parent().parent().parent();
    let CurrChildSessioIndex = getChildSessionRowIndex($(this), ChildSessioTbodyDom);
    if (CurrChildSessioIndex == 0) {
        $('#Submitted_Content').empty();
        $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">已经是第一位，无法上移</div>');
        $('#staticBackdrop').modal('show');

        window.setTimeout(function () {
            // $("#staticBackdropClose").trigger("click");
            $("#staticBackdrop").modal('hide');
        }, 1500);
    }
    else {
        moveChildSessioinRowUp(ChildSessioTbodyDom, CurrChildSessioIndex)
    }
})

function getChildSessionRowIndex(clickedButton, tbodyDom) {
    // Find the parent row of the clicked button
    var row = $(clickedButton).closest('tr');

    // Get the index of the row within the table body
    var rowIndex = $(tbodyDom).children('tr').index(row);

    // Return the row index
    return rowIndex;
}

function moveChildSessioinRowUp(tbodyDom, rowIndex) {
    var rowToMove = $(tbodyDom).children('tr').eq(rowIndex);
    // Get the previous row
    var previousRow = rowToMove.prev();
    // Move the row
    rowToMove.insertBefore(previousRow);
}

$(document).on('click', ".ChildSessionDown", function () {
    let ChildSessioTbodyDom = $(this).parent().parent().parent().parent();
    let CurrChildSessioIndex = getChildSessionRowIndex($(this), ChildSessioTbodyDom);
    let LargestRowIndex = ChildSessioTbodyDom.children('tr').length - 1;
    if (CurrChildSessioIndex == LargestRowIndex) {
        $('#Submitted_Content').empty();
        $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">已经是最后一位，无法下移</div>');
        $('#staticBackdrop').modal('show');

        window.setTimeout(function () {
            // $("#staticBackdropClose").trigger("click");
            $("#staticBackdrop").modal('hide');
        }, 1500);
    }
    else {
        moveChildSessionRowDown(ChildSessioTbodyDom, CurrChildSessioIndex);
    }
})

function moveChildSessionRowDown(tbodyDom, rowIndex) {
    var rowToMove = $(tbodyDom).children('tr').eq(rowIndex);
    // Get the next row
    var nextRow = rowToMove.next();
    // Move the row
    rowToMove.insertAfter(nextRow);
}

$(document).on('click', ".ChildSessionDel", function () {
    let ChildSessioTbodyDom = $(this).parent().parent().parent().parent();
    let CurrChildSessioIndex = getChildSessionRowIndex($(this), ChildSessioTbodyDom);
    ChildSessioTbodyDom.children('tr').eq(CurrChildSessioIndex).remove();
    // let trDom = $(this).parent().parent().parent();
    // let index = trDom.children().eq(0).text();

    // let SessionIndex = trDom.parent().parent().prev().children().eq(0).text();
    // let tbodyDom = $("#MeetingSession").children().eq(SessionIndex - 1).children().eq(1).children().eq(1);
    // if (index < trDom.parent().children().length) {
    //     let CurrIndex = trDom.children().eq(0).text();
    //     ChildSessioinMove(CurrIndex, CurrIndex - tbodyDom.children().length, tbodyDom);
    // }

    // tbodyDom.children().last().remove();
})

function ChildSessioinMove(CurrIndex, span, tbodyDom) {
    let rowIndex = GetTableRowIndex(CurrIndex, UpActionType);
    let BeginSession = GetChildSession(rowIndex, tbodyDom);
    if (span > 0) {
        for (let i = 0; i <= span; i++) {
            if (i < span) {
                let MovingSession = GetChildSession(GetTableRowIndex(CurrIndex - i - 1, UpActionType), tbodyDom);
                RenderChildSession(tbodyDom, GetTableRowIndex(CurrIndex - i, UpActionType), MovingSession);
            }
            else {
                RenderChildSession(tbodyDom, GetTableRowIndex(CurrIndex - i, UpActionType), BeginSession);
            }

        }
    }
    else if (span < 0) {
        for (let i = 0; i >= span; i--) {
            if (i > span) {
                let MovingSession = GetChildSession(GetTableRowIndex(CurrIndex - i - 1, DownActionType), tbodyDom);
                RenderChildSession(tbodyDom, GetTableRowIndex(CurrIndex - i, UpActionType), MovingSession);
            }
            else {
                RenderChildSession(tbodyDom, GetTableRowIndex(CurrIndex - i, UpActionType), BeginSession);
            }
        }
    }
}

function GetChildSession(rowIndex, tbodyDom) {
    let targetTrDom = tbodyDom.children().eq(rowIndex);

    let ChildSessionName = targetTrDom.children().eq(1).children().val();
    let ChildSessionDuration = targetTrDom.children().eq(2).children().val();
    let ChildSessionRole = targetTrDom.children().eq(3).children().val();

    let ChildSessionData = { Name: ChildSessionName, Duration: ChildSessionDuration, Role: ChildSessionRole };
    return ChildSessionData;
}

function RenderChildSession(tbodyDom, rowIndex, NewChildSessionDta) {
    let targetTrDom = tbodyDom.children().eq(rowIndex);

    targetTrDom.children().eq(1).children().val(NewChildSessionDta.Name);
    targetTrDom.children().eq(2).children().val(NewChildSessionDta.Duration);
    targetTrDom.children().eq(3).children().val(NewChildSessionDta.Role);
}
