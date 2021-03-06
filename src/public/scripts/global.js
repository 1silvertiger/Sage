const publicVapidKey = 'BD4yCfeJYnR6UmsHergYGB2m3NGPoeJzqS4I-oBeg9Fq7zzo9UgqsqnejmHulxDX_FkWrFpzPovOLiYHBPtnJSM';

const tagMap = new Object();

//Register service worker
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/serviceWorker.js')
//         .then(function (reg) {
//             // registration worked
//             console.log('Registration succeeded. Scope is ' + reg.scope);
//             console.log('Registering push...');
//             reg.pushManager.subscribe({
//                 userVisibleOnly: true,
//                 applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
//             }).then(subscription => {
//                 console.log('Sending request...');
//                 fetch('/subscribe', {
//                     method: 'POST',
//                     body: JSON.stringify({ subscription: JSON.stringify(subscription) }),
//                     headers: {
//                         'content-type': 'application/json'
//                     }
//                 }).then(response => {
//                     console.log('Sent request.');
//                     console.log('Reponse:');
//                     console.log(response);
//                 });
//             });
//             console.log('Registered push.');
//         }).catch(function (error) {
//             // registration failed
//             console.log('Registration failed with ' + error);
//         });
// }

$(document).ready(function () {
    loadGapi();
    refreshTagMap();

    M.Sidenav.init(document.querySelectorAll('.sidenav'), {});
    M.FloatingActionButton.init(document.querySelectorAll('.fixed-action-btn'), {});
});

function logout() {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut();
}

async function loadGapi() {
    gapi.load('auth2', function () {
        gapi.auth2.init();
    });
}

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
    const temp = periodId === "1";
    switch (periodId) {
        case 1:
        case "1":
            return 'day(s)';
        case 2:
        case "2":
            return 'week(s)';
        case 3:
        case "3":
            return 'month(s)';
        case 4:
        case "4":
            return 'quarter(s)';
        case 5:
        case "5":
            return 'year(s)';
    }
}

function getMomentPeriod(periodId) {
    switch (periodId) {
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

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}