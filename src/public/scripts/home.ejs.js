if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/serviceWorker.js')
        .then(function (reg) {
            // registration worked
            console.log('Registration succeeded. Scope is ' + reg.scope);
            console.log('Registering push...');
            reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            }).then(subscription => {
                console.log('Sending request...');
                fetch('/subscribe', {
                    method: 'POST',
                    body: JSON.stringify({ subscription: JSON.stringify(subscription) }),
                    headers: {
                        'content-type': 'application/json'
                    }
                }).then(response => {
                    console.log('Sent request.');
                    console.log('Reponse:');
                    console.log(response);
                });
            });
            console.log('Registered push.');
        }).catch(function (error) {
            // registration failed
            console.log('Registration failed with ' + error);
        });
}

$(document).ready(function () {
    M.AutoInit();
    $("#plaid").click(function () {
        handler.open();
    });
});