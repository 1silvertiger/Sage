function onSignIn(googleUser) {
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
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        xhrFields: {
            withCredentials: true
         },
        success: function(data, status) {
            console.log("success");
            window.location.replace(URL + "/home");
        },
        error: function(jqXHR, status, error) {
            //TODO: handle error
            alert("An error occurred: \n" + status + "\n" + error);
        }
    });
    
}