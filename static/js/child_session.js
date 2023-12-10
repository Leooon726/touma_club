
$(document).on('click', '.ChildSessionUp', function () {
    let ChildSessionsContainer = getChildSessionsContainerWithButton($(this));
    let CurChildSession = getCurChildSessionWithButton($(this));

    let CurChildSessioIndex = getChildSessionElementIndex(ChildSessionsContainer, CurChildSession);
    if (CurChildSessioIndex == 0) {
        $('#Submitted_Content').empty();
        $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">已经是第一位，无法上移</div>');
        $('#staticBackdrop').modal('show');

        window.setTimeout(function () {
            $("#staticBackdrop").modal('hide');
        }, 1500);
    }
    else {
        moveChildSessioinRowUp(ChildSessionsContainer, CurChildSession)
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

function moveChildSessioinRowUp(ChildSessionsContainer, CurChildSession) {
    let previousSibling = CurChildSession.prev();
    if (previousSibling.length !== 0) {
      CurChildSession.insertBefore(previousSibling);
    }
}

$(document).on('click', ".ChildSessionDown", function () {
    let ChildSessionsContainer = getChildSessionsContainerWithButton($(this));

    let CurChildSession = getCurChildSessionWithButton($(this));

    let CurChildSessioIndex = getChildSessionElementIndex(ChildSessionsContainer, CurChildSession);
    let LargestRowIndex = ChildSessionsContainer.children('.child-session').length- 1;
    if (CurChildSessioIndex == LargestRowIndex) {
        $('#Submitted_Content').empty();
        $('#Submitted_Content').append('<div class="alert alert-danger" role="alert">已经是最后一位，无法下移</div>');
        $('#staticBackdrop').modal('show');

        window.setTimeout(function () {
            $("#staticBackdrop").modal('hide');
        }, 1500);
    }
    else {
        moveChildSessionRowDown(ChildSessionsContainer, CurChildSession);
    }
})

function moveChildSessionRowDown(childSessionsContainer, curChildSession) {
    let nextSibling = curChildSession.next();
    if (nextSibling.length !== 0) {
      curChildSession.insertAfter(nextSibling);
    }
}

$(document).on('click', ".ChildSessionDel", function () {
    let ChildSessionsContainer = getChildSessionsContainerWithButton($(this));
    let CurChildSession = getCurChildSessionWithButton($(this));
    CurChildSession.remove();
    
    // If ChildSessionsContainer do not have any child any more, remove the table and create an input duration box.
    if (ChildSessionsContainer.children('.child-session').length === 0) {
        let parentSession = ChildSessionsContainer.parent();
        ChildSessionsContainer.remove();
        let durationInputBox = CreateDurationInputBox();
        durationInputBox.appendTo(parentSession);
    }
})

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

function hasKeyInDictionary(key, dictionary) {
    return $.inArray(key, Object.keys(dictionary)) !== -1;
  }

function getChildSessionsContainerWithButton(ButtonObject) {
    let childSessionsTable = ButtonObject.closest('#childSessionsTable');
    return childSessionsTable;
  }

function getCurChildSessionWithButton(ButtonObject) {
// Find the closes object with class "child-session".
    return ButtonObject.closest('.child-session');
  }

function getChildSessionElementIndex(childSessionsContainer, childSessionElement) {
    let childElements = childSessionsContainer.children('.child-session');
    let index = childElements.index(childSessionElement);
    return index;
  }

function createChildSessionsAsTable(data = {}) {
    let container = $("<div></div>");
    container.attr("id", "childSessionsTable");

    if (hasKeyInDictionary('ChildSessions', data) && data.ChildSessions && data.ChildSessions.length > 0) {
        for (let i = 0; i < data.ChildSessions.length; i++) {
            let childSessionElement = CreateOneChildSession(data.ChildSessions[i]);
            container.append(childSessionElement);
        }
    }

    return container;
}

function GetRoleSelect(SelectedRole) {
    let SelectDom = $("<select class=\"form-control\"></select>");
    let OptionsDom_Default = $("<option value=\"\">请选择角色</option>");
    OptionsDom_Default.appendTo(SelectDom);
    updateRoleSelect(SelectDom, SelectedRole);

    // Add click event handler
    SelectDom.on("focus", function () {
        updateRoleSelect(SelectDom, SelectedRole);
    });

    return SelectDom;
}

function CreateFieldContainerInChildSession(data) {
    function createDurationContainer(data) {
        // Children Session Duration
        let durationLabel = $("<label>时长</label>"); // Add label
        let ChildSession_Duration = $("<input type=\"text\" class=\"form-control\" />");
        ChildSession_Duration.addClass("user-input-content");
        ChildSession_Duration.attr("id", "duration");
        if (data.Duration == "")
            ChildSession_Duration.attr("placeholder", "请输入子环节时长");
        else
            ChildSession_Duration.attr("value", data.Duration);

        let durationContainer = $("<div class=\"row-container\"></div>"); // Add the row-container class
        durationContainer.append(durationLabel);
        durationContainer.append(ChildSession_Duration);
        return durationContainer;
    }
    function createEventNameContainer(data) {
        // Children Session Name
        let ChildSession_Name = $("<input type=\"text\" class=\"form-control\" />");
        ChildSession_Name.addClass("user-input-content");
        ChildSession_Name.attr("id", "event_name");
        // let nameLabel = $("<label>议程</label>"); // Add label
        if (data.Name == "")
            ChildSession_Name.attr("placeholder", "请输入子环节名称");
        else
            ChildSession_Name.attr("value", data.Name);

        let nameContainer = $("<div class=\"row-container\"></div>");
        // nameContainer.append(nameLabel);
        nameContainer.append(ChildSession_Name);
        return nameContainer;
    }
    
    function createRoleContainer(data) {
        let roleSelectLabel = $("<label>角色</label>"); // Add label
        let ChildSession_Role = GetRoleSelect(data.Role);
        ChildSession_Role.addClass("user-input-content");
        ChildSession_Role.attr("id", "role");
    
        let roleContainer = $("<div class=\"row-container\"></div>");
        roleContainer.append(roleSelectLabel);
        roleContainer.append(ChildSession_Role);
        return roleContainer;
    }

    // Create the sub-container
    let subContentContainer = $("<div></div>");
    subContentContainer.attr("id", "childsessionFieldsContainer");

    let nameContainer = createEventNameContainer(data);
    subContentContainer.append(nameContainer);

    // Children Session Duration
    let durationContainer = createDurationContainer(data);
    subContentContainer.append(durationContainer);

    // Children Session Role
    let roleContainer = createRoleContainer(data);
    subContentContainer.append(roleContainer);

    return subContentContainer;
}

function CreateOneChildSession(data) {
    if (jQuery.isEmptyObject(data)) {
        data = { ChildIndex: 0, Name: "", Duration: 0, Role: "" };
    }

    let FieldContainer = CreateFieldContainerInChildSession(data);

    // Children Session Operation
    let Center_Btn = CreateChildSessionActionButtonGroup();

    let btnContainer = $("<div></div>");
    btnContainer.append(Center_Btn);

    let childSessionContainer = $("<div></div>");
    childSessionContainer.addClass("child-session");
    childSessionContainer.append(FieldContainer);
    childSessionContainer.append(btnContainer);

    return childSessionContainer;
}
