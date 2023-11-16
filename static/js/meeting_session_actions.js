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

    //Add Title
    let Span_SessionNum = $("<span></span>");
    Span_SessionNum.addClass("input-group-text");
    Span_SessionNum.text(data.Index);

    let Input_SessionName = $("<input />");
    Input_SessionName.attr("type", "text");
    Input_SessionName.addClass("form-control");
    if (data.Title === "")
        Input_SessionName.attr("placeholder", "请输入环节名称");
    else
        Input_SessionName.attr("value", data.Title);

    let Input_SessionDuration = $("<input />");
    Input_SessionDuration.attr("type", "text");
    Input_SessionDuration.addClass("form-control");
    if (!("Duration" in data))
        Input_SessionDuration.attr("placeholder", "请输入环节时长");
    else
        Input_SessionDuration.attr("value", data.Duration);

    //Add Operational Button
    let Button_ChildSession_Add = GetButtonDom("info", "添加子环节", "AddChildSession");
    let Button_Session_Up = GetButtonDom("primary", "上移本环节", "SessionUp");
    let Button_Session_Down = GetButtonDom("warning", "下移本环节", "SessionDown");
    let Button_Session_Del = GetButtonDom("danger", "删除本环节", "SessionDel");

    let DivRow_InputGroup = GetDivDom();
    DivRow_InputGroup.addClass("input-group mb-3");
    Span_SessionNum.appendTo(DivRow_InputGroup);
    Input_SessionName.appendTo(DivRow_InputGroup);
    Input_SessionDuration.appendTo(DivRow_InputGroup);
    Button_ChildSession_Add.appendTo(DivRow_InputGroup);
    Button_Session_Up.appendTo(DivRow_InputGroup);
    Button_Session_Down.appendTo(DivRow_InputGroup);
    Button_Session_Del.appendTo(DivRow_InputGroup);

    //Add Table
    //Add thead
    let th_Child_Num = GetThDom("序号");
    let th_Child_SessionName = GetThDom("子环节名称");
    let th_Child_Duration = GetThDom("子环节时间");
    let th_Child_Role = GetThDom("选择角色");
    let th_Child_Operation = GetThDom("子环节操作");

    let thtrDom = $("<tr></tr>");
    th_Child_Num.appendTo(thtrDom);
    th_Child_SessionName.appendTo(thtrDom);
    th_Child_Duration.appendTo(thtrDom);
    th_Child_Role.appendTo(thtrDom);
    th_Child_Operation.appendTo(thtrDom);

    let theadDom = $("<thead></thead>");
    thtrDom.appendTo(theadDom);

    let Table = $("<table></table>");
    Table.addClass("table table-success table-bordered table-striped");
    theadDom.appendTo(Table);

    //Add tbody
    let tbodyDom = $("<tbody></tbody");
    if (data.ChildSessions && data.ChildSessions.length > 0) {
        for (let i = 0; i < data.ChildSessions.length; i++) {
            let tbtrDom = CreateChildSessionElement(data.ChildSessions[i]);
            tbtrDom.appendTo(tbodyDom);
        }
    }
    tbodyDom.appendTo(Table);

    //Add Container
    let DivContainer = GetDivDom();
    // DivContainer.attr("id", NewSessionID);
    DivContainer.addClass("bd-example"); //container-fluid
    // DivRow_Title.appendTo(DivContainer);
    DivRow_InputGroup.appendTo(DivContainer);
    Table.appendTo(DivContainer);

    let DivFormItem = $("#MeetingSession");
    DivContainer.appendTo(DivFormItem);
}


//Create Children Session
function CreateChildSessionElement(data) {
    if (jQuery.isEmptyObject(data)) {
        data = { ChildIndex: 0, Name: "", Duration: 0, Role: "" };
    }

    //Num
    let ChildNumCol = $("<th scope=\"row\" style=\"text-align: center;\">" + data.ChildIndex + "</th>")

    //Children Session Name
    let ChildSession_Name = $("<input type=\"text\"  class=\"form-control\" />")
    if (data.Name == "")
        ChildSession_Name.attr("placeholder", "请输入子环节名称");
    else
        ChildSession_Name.attr("value", data.Name);
    let TD_Name = $("<td></td>");
    ChildSession_Name.appendTo(TD_Name);

    //Children Session Duration
    let ChildSession_Duration = $("<input type=\"text\"  class=\"form-control\" />")
    if (data.Duration == "")
        ChildSession_Duration.attr("placeholder", "请输入子环节时长");
    else
        ChildSession_Duration.attr("value", data.Duration);
    let TD_Duration = $("<td></td>");
    ChildSession_Duration.appendTo(TD_Duration);

    //Children Session Role
    let ChildSession_Role = GetRoleSelect(data.Role);
    let TD_Role = $("<td></td>");
    ChildSession_Role.appendTo(TD_Role);

    //Children Session Operation
    let btn_Child_Up = GetButtonDom("primary", "▲", "ChildSessionUp");
    let btn_Child_Down = GetButtonDom("warning", "▼", "ChildSessionDown");
    let btn_Child_Del = GetButtonDom("danger", "×", "ChildSessionDel");

    let Center_Btn = $("<center></center>");
    Center_Btn.append(btn_Child_Up);
    Center_Btn.append(btn_Child_Down);
    Center_Btn.append(btn_Child_Del);

    let TD_Btn = $("<td></td>");
    TD_Btn.append(Center_Btn);

    let tbtrDom = $("<tr></tr>");
    ChildNumCol.appendTo(tbtrDom);
    TD_Name.appendTo(tbtrDom);
    TD_Duration.appendTo(tbtrDom);
    TD_Role.appendTo(tbtrDom);
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

function GetThDom(colName) {
    let thDom = $("<th>" + colName + "</th>");
    thDom.attr("scope", "col");
    thDom.attr("style", 'style="text-align: center;"');
    return thDom;
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

    let tbodyDom = $(this).parent().next().children().eq(1);
    let newIndex = tbodyDom.children().length + 1;


    let NewChildSessionData = { ChildIndex: newIndex, Name: "", Duration: 0, Role: "" };
    let newTbTrDom = CreateChildSessionElement(NewChildSessionData);
    tbodyDom.append(newTbTrDom);

})

// bind Session Up Method
$(document).on('click', '.SessionUp', function () {
    // Check the index
    let index = parseInt($(this).parent().children().eq(0).text());
    if (index == 1) {
        $('#Submitted_Content').empty();
        $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">已经是第一位，无法上移</div>');
        $('#staticBackdrop').modal('show');

        window.setTimeout(function () {
            // $("#staticBackdropClose").trigger("click");
            $("#staticBackdrop").modal('hide');
        }, 1500);
    }
    else {
        SessionMove(index, 1)
    }


})

$(document).on('click', '.SessionDown', function () {
    let index = parseInt($(this).parent().children().eq(0).text());
    let SessionsCount = $("#MeetingSession").children().length;
    if (index == SessionsCount) {
        $('#Submitted_Content').empty();
        $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">已经是最后一位，无法下移</div>');
        $('#staticBackdrop').modal('show');

        window.setTimeout(function () {
            // $("#staticBackdropClose").trigger("click");
            $("#staticBackdrop").modal('hide');
        }, 1500);
    }
    else {
        SessionMove(index, -1)
    }
})

$(document).on('click', '.SessionDel', function () {
    let index = parseInt($(this).parent().children().eq(0).text());
    let SessionsCount = $("#MeetingSession").children().length;
    if (index < SessionsCount) {
        console.log("Down the Session")
        SessionMove(index, index - SessionsCount);
    }

    //删除最后一个子元素
    $("#MeetingSession").children().last().remove();
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
    let trDom = $(this).parent().parent().parent();
    let index = trDom.children().eq(0).text();
    if (index == 1) {
        $('#Submitted_Content').empty();
        $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">已经是第一位，无法上移</div>');
        $('#staticBackdrop').modal('show');

        window.setTimeout(function () {
            // $("#staticBackdropClose").trigger("click");
            $("#staticBackdrop").modal('hide');
        }, 1500);
    }
    else {
        let SessionIndex = trDom.parent().parent().prev().children().eq(0).text();
        let tbodyDom = $("#MeetingSession").children().eq(SessionIndex - 1).children().eq(1).children().eq(1);
        let CurrIndex = trDom.children().eq(0).text();
        ChildSessioinMove(CurrIndex, 1, tbodyDom);
    }
})

$(document).on('click', ".ChildSessionDown", function () {
    let trDom = $(this).parent().parent().parent();
    let index = trDom.children().eq(0).text();
    if (index == trDom.parent().children().length) {
        $('#Submitted_Content').empty();
        $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">已经是最后一位，无法下移</div>');
        $('#staticBackdrop').modal('show');

        window.setTimeout(function () {
            // $("#staticBackdropClose").trigger("click");
            $("#staticBackdrop").modal('hide');
        }, 1500);
    }
    else {
        let SessionIndex = trDom.parent().parent().prev().children().eq(0).text();
        let tbodyDom = $("#MeetingSession").children().eq(SessionIndex - 1).children().eq(1).children().eq(1);
        let CurrIndex = trDom.children().eq(0).text();
        ChildSessioinMove(CurrIndex, -1, tbodyDom);
    }
})

$(document).on('click', ".ChildSessionDel", function () {
    let trDom = $(this).parent().parent().parent();
    let index = trDom.children().eq(0).text();

    let SessionIndex = trDom.parent().parent().prev().children().eq(0).text();
    let tbodyDom = $("#MeetingSession").children().eq(SessionIndex - 1).children().eq(1).children().eq(1);
    if (index < trDom.parent().children().length) {
        let CurrIndex = trDom.children().eq(0).text();
        ChildSessioinMove(CurrIndex, CurrIndex - tbodyDom.children().length, tbodyDom);
    }

    tbodyDom.children().last().remove();
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
