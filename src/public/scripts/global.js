const tagMap = new Object();

//Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/serviceWorker.js')
        .then(function (reg) {
            // registration worked
            console.log('Registration succeeded. Scope is ' + reg.scope);
        }).catch(function (error) {
            // registration failed
            console.log('Registration failed with ' + error);
        });
}

$(document).ready(function () {
    refreshTagMap();

    M.Sidenav.init(document.querySelectorAll('.sidenav'), {});
    M.FloatingActionButton.init(document.querySelectorAll('.fixed-action-btn'), {});

    $("#logout").click(function () {
        alert(URL);
        $.ajax({
            type: "POST",
            url: URL + '/logout',
            data: JSON.stringify({}),
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
                console.log('jqxhr: ' + JSON.stringify(jqXHR));
                console.log('status: ' + status);
                console.log('error:' + error);
                alert("An error occurred: \n" + status + "\n" + error);
            }
        });
        GoogleAuth.signOut();
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
                refreshTagMap();
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

function getTagId(tagName) {
    return tagMap[tagName];
}

function getTagsFromNames(tagNames) {
    const tags = new Array();
    for (let i = 0; i < tagNames.length; i++)
        tags.push({ id: getTagId(tagNames[i]) || null, userId: user.id, name: tagNames[i] });
    return tags;
}

async function refreshTagMap() {
    for (let i = 0; i < user.tags.length; i++)
        tagMap[user.tags[i].name] = user.tags[i].id;
}