$(document).ready(function () {
    M.Sidenav.init(document.querySelectorAll('.sidenav'), {});
    M.FloatingActionButton.init(document.querySelectorAll('.fixed-action-btn'), {});

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

function getSemanticPeriod(periodId) {
    switch(periodId) {
        case 1: return 'day(s)'
        case 2: return 'week(s)'
        case 3: return 'month(s)'
        case 4: return 'quarter(s)'
        case 5: return 'year(s)'
    }
}

function getMomentPeriod(periodId) {
    switch(periodId) {
        case 1: return 'days'
        case 2: return 'weeks'
        case 3: return 'months'
        case 4: return 'quarters'
        case 5: return 'years'
    }
}