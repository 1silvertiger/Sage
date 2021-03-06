$(document).ready(function() {
    renderButton();
});

function onSignIn(googleUser) {
    $('.preloader-wrapper').addClass('active');
    $('#logging-in').removeClass('hide');
    $('#signIn').addClass('hide');
    var profile = googleUser.getBasicProfile();

    var data = {
        idtoken: googleUser.getAuthResponse().id_token,
        firstName: profile.getGivenName(),
        lastName: profile.getFamilyName(),
        imageUrl: profile.getImageUrl(),
        email: profile.getEmail()
    };

    $.ajax({
        type: "POST",
        url: URL + '/tokensignin',
        data: JSON.stringify(data),
        dataType: "text",
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        xhrFields: {
            withCredentials: true
        },
        success: function (data, status) {
            // window.location.replace(URL + (returnPath || "/home"));
            window.location.replace(URL + "/home");
        },
        error: function (jqXHR, status, error) {
            //TODO: handle error
            $('.preloader-wrapper').removeClass('active');
            $('#logging-in').addClass('hide');
            $('.form-signin').removeClass('hide');
            alert("An error occurred: \n" + status + "\n" + error);
        }
    });

}

function onError(error) {
    console.log(error);
}

function renderButton() {
    gapi.signin2.render('loginBtn', {
        'scope': 'profile email',
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'light',
        'onsuccess': onSignIn,
        'onfailure': onError
    });
}