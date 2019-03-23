$(document).ready(function () {
    $("#logout").click(function () {
        $.ajax({
            type: "POST",
            url: URL + '/logout',
            data: null,
            dataType: "text",
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            xhrFields: {
                withCredentials: true
            },
            success: function (data, status) {
                // window.location.replace(URL);
            },
            error: function (jqXHR, status, error) {
                //TODO: handle error
                alert("An error occurred: \n" + status + "\n" + error);
            }
        });
    });
    //Materialize component initialization
    //M.AutoInit();
    // $('.sidenav').sidenav();
    // $('.fixed-action-btn').floatingActionButton();
});