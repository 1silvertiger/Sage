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
});

function refreshUser() {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: URL + '/refreshUser'
            , success: function (data) {
                refresh = JSON.parse(data);
                user.items = refresh.items;
                user.budgetItems = refresh.budgetItems;
                user.piggyBanks = refresh.piggyBanks;
                user.bills = refresh.bills;
                resolve(true);
            }
            , error: function (jqxhr, status, error) {
                console.log(error);
                resolve(false);
            }
        });
    });
}