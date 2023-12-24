const templateSelect = document.getElementById("templateSelect");
const submitButton = document.getElementById("submitButton");

submitButton.addEventListener("click", function() {
    const selectedTemplate = templateSelect.value;
    // Check if selectedTemplate is empty
    if (!selectedTemplate.trim()) {
        // Show an alert if the selected template is empty
        alert("请选择一个议程表模板.");
        return; // Exit the function to prevent further execution
    }

    MaskUtil.mask();

    const formData = new FormData();
    formData.append("selected_template", selectedTemplate);

    fetch("./set_selected_template", {
        method: "POST",
        body: formData
    })
    .then(response => {
        console.log(response); // Add this line to check the response

        if (response.ok) {
            return response.json(); // Assuming the response is in JSON format
        } else {
            throw new Error("Error: " + response.status);
        }
    })
    .then(data => {
        // Handle the response data here
        console.log(data);
        // Redirect to the desired location after successful response
        window.location = "./InputAgendaContent";
    })
    .catch(error => {
        // Handle any errors that occurred during the request
        console.error("Error:", error);
    });
});


/**
 * 说明：数据进行加载时的遮罩层，基于bootstrap的页面模态框做封装处理
 * 使用方法:
 * 开启:MaskUtil.mask();
 * 关闭:MaskUtil.unmask();
 */
 var MaskUtil = (function(){
    var $mask,$maskMsg;
    var defMsg = '跳转中，请稍等。。。';
    function init(){
        if(!$mask){
            $mask = $("<div id=\"myWaitingModal\" class=\"modal fade\" data-keyboard=\"false\" data-backdrop=\"static\" data-role=\"dialog\" " +
                "aria-labelledby=\"myWaitingModalLabel\" aria-hidden=\"true\">" +
                "<div id=\"loading\" class=\"loading\"><span class=\"spinner-border\" role=\"status\"></span>"+
                    "<span>&nbsp;&nbsp;"+defMsg+"</span></div></div>").appendTo("body");
        }
    }
    return {
        mask:function(){
            init();
            $('#myWaitingModal').modal('show');
        }
        ,unmask:function(){
            $('#myWaitingModal').modal('hide');
            $mask = null;
            $('#myWaitingModal').remove();
            $('.modal-backdrop').hide();
        }
    }
}());
