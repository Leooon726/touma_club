function CreateParentSessionDurationInputBox(data={}) {
    function isValidDurationNumber(value) {
        return /^-?\d*\.?\d+$/.test(value);
    }

    function addDurationCheckListener(inputBox) {
        let previousValidValue = inputBox.val();
    
        // Use 'blur' event to validate when the input loses focus
        inputBox.on('blur', function () {
            // Validate if the input is a valid number
            if (!isValidDurationNumber(inputBox.val())) {
                // You can customize this part to handle invalid input (e.g., show an error message)
                alert("时长输入错误，需要输入整数或者小数，如\"0\"或\"1.5\"");
                inputBox.val(previousValidValue); // Revert to the previous valid value
            } else {
                // Update the previous valid value if the input is valid
                previousValidValue = inputBox.val();
            }
        });
    }

    let container = $("<div></div>"); // Create a container to hold the label and input box
    container.addClass("input-parent-session-duration-container"); // Add a CSS class to style the container
    container.attr("id", "childSessionDurationInputBox");

    let label = $("<span>时长(分钟)</span>"); // Create the label element with the desired text
    label.addClass("input-parent-session-duration-label"); // Add a CSS class to style the label if needed

    let input = $("<input />"); // Create the input element
    input.attr("type", "text");
    input.attr("id", "parentSessionDuration");
    input.addClass("form-control");

    if (!("Duration" in data)) {
        input.attr("placeholder", "时长默认为0分钟");
        input.attr("value", "0"); // Set the value as "0"
    }
    else {
        input.attr("value", data.Duration);
    }

    container.append(label); // Append the label before the input box
    container.append(input); // Append the input box

    addDurationCheckListener(input);

    return container; // Return the container element
}

function CreateSessionElement(data) {
    if (jQuery.isEmptyObject(data)) {
        data = {Title: "", ChildSessions: [] };
    }

    let foldButton = $("<button />");
    foldButton.addClass("fold-button");
    foldButton.text(">");

    let Input_SessionName = $("<input />");
    Input_SessionName.attr("type", "text");
    Input_SessionName.attr("id", "parentSessionName");
    Input_SessionName.addClass("form-control");
    if (data.Title === "")
        Input_SessionName.attr("placeholder", "环节名称");
    else
        Input_SessionName.attr("value", data.Title);

    //Add Operational Button
    let Button_ChildSession_Add = GetButtonDom("info", "+", "AddChildSession");
    let Button_Session_Up = GetButtonDom("primary", "▲", "SessionUp");
    let Button_Session_Down = GetButtonDom("warning", "▼", "SessionDown");
    let Button_Session_Del = GetButtonDom("danger", "x", "SessionDel");

    let DivRow_InputGroup = GetDivDom();
    DivRow_InputGroup.addClass("input-group mb-3");
    foldButton.appendTo(DivRow_InputGroup);
    Input_SessionName.appendTo(DivRow_InputGroup);
    Button_ChildSession_Add.appendTo(DivRow_InputGroup);
    Button_Session_Up.appendTo(DivRow_InputGroup);
    Button_Session_Down.appendTo(DivRow_InputGroup);
    Button_Session_Del.appendTo(DivRow_InputGroup);

    let childSessionsObject;
    if (data.ChildSessions && data.ChildSessions.length > 0) {
        childSessionsObject = createChildSessionsObject(data)
    } else {
        childSessionsObject = CreateParentSessionDurationInputBox(data);
    }
    childSessionsObject.hide(); // Hide the childSessionsObject by default

    // Add click event handler to the foldButton
    foldButton.on("click", function (event) {
        event.preventDefault(); // Prevent the default form submission behavior
        foldButtonParent = foldButton.parent().parent()
        let targetObjectToBeFolded = foldButtonParent.find("#childSessionDurationInputBox, #childSessionsObject");

        targetObjectToBeFolded.toggle(); // Toggle the visibility of the childSessionsObject

        // Update the foldButton text based on the visibility of childSessionsObject
        if (targetObjectToBeFolded.is(":visible")) {
            foldButton.text("v"); // Change the button text to "v" when childSessionsObject is visible
        } else {
            foldButton.text(">"); // Change the button text back to ">" when childSessionsObject is hidden
        }
    });

    //Add Container
    let DivContainer = GetDivDom();
    DivContainer.addClass("parent-and-children-session"); //container-fluid
    DivRow_InputGroup.appendTo(DivContainer);
    childSessionsObject.appendTo(DivContainer);

    let DivFormItem = $("#MeetingSession");
    DivContainer.appendTo(DivFormItem);
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

function parseRoleNameStringToRoleList(roleNameString) {
    // Step 1: Separate the whole string into lines
    let roleNameLines = roleNameString.split(/[\r\n]+/);

    // Add the default role strings here
    const defaultRoles = ["所有人:所有人", "会员&宾客:会员&宾客"]; // Array of default roles
    // Prepend default roles to the roleNameLines
    roleNameLines = defaultRoles.concat(roleNameLines);

    // Step 2: Extract the part before ":" or "：" into a role list
    let roleList = roleNameLines.map(roleLine => {
        // Split the line at ":" or "：" and trim the parts
        let roleParts = roleLine.split(/[:：]/);
        return roleParts[0].trim();
    });

    return roleList.filter(role => role !== ""); // Filter out any empty roles
}

function updateRoleSelect(selectElement, selectedRole) {
    // Clear existing options
    selectElement.empty();

    // Add new options
    let OptionsDom_Default = $("<option value=\"\">请选择角色</option>");
    OptionsDom_Default.appendTo(selectElement);

    let RoleData = getRoleNameString();
    let RoleList = parseRoleNameStringToRoleList(RoleData);
    for (let r = 0; r < RoleList.length; r++) {
        let role = RoleList[r];
        let OptionStr_Role = "<option value=\"" + role + "\"";
        if (role == selectedRole)
            OptionStr_Role += " selected";
        OptionStr_Role += ">" + role + "</option>";

        let OptionDom_Role = $(OptionStr_Role);
        OptionDom_Role.appendTo(selectElement);
    }
}

function GetAgendaContentAsDictList() {
    function ParseChildSession(sessionRow) {
        let childsessionFieldsContainer = $(sessionRow).find("#childsessionFieldsContainer");
        let fieldData = {};

        childsessionFieldsContainer.find(".user-input-content").each(function (index, fieldObject) {
            let $fieldObject = $(fieldObject); // Convert DOM element to jQuery object
            let fieldName = $fieldObject.attr("id");
            let fieldContent = $fieldObject.val();
            // Save fieldName as key and fieldContent as value in the dictionary
            fieldData[fieldName] = fieldContent;
        });
        return fieldData;
    }

    function ParseChildSessions(parentSession) {
        let childSessionList = [];
        // Every child session has event_name, duration and role.
        let childSessionsObject = $(parentSession).find("#childSessionsObject");
        childSessionsObject.children(".child-session").each(function (index, sessionRow) {
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

$(document).on('click', ".AddChildSession", function () {
    let CurrSession = getCurrentSessionFromOperationButton($(this));
    let childSessionsObject = $(CurrSession).find("#childSessionsObject");
    
    // If cannot find #childSessionsObject, create one by calling createChildSessionsObject.
    if (childSessionsObject.length === 0) {
        childSessionsObject = createChildSessionsObject();
        $(CurrSession).append(childSessionsObject);
        let inputDurationContainer = $(CurrSession).find(".input-parent-session-duration-container");
        if (inputDurationContainer.length > 0) {
            inputDurationContainer.remove();
        }
    }

    let NewChildSession = CreateOneChildSession();
    childSessionsObject.append(NewChildSession);
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
    }
})

$(document).on('click', '.SessionDel', function () {
    let CurrSession = $(this).parent().parent()
    CurrSession.remove();
})
