function onSignIn(googleUser) {
    // Useful data for your client-side scripts:
    var profile = googleUser.getBasicProfile();
    console.log("ID: " + profile.getId()); // Don't send this directly to your server!
    console.log('Full Name: ' + profile.getName());
    console.log('Given Name: ' + profile.getGivenName());
    console.log('Family Name: ' + profile.getFamilyName());
    console.log("Image URL: " + profile.getImageUrl());
    console.log("Email: " + profile.getEmail());

    // The ID token you need to pass to your backend:
    var id_token = googleUser.getAuthResponse().id_token;
    console.log("ID Token: " + id_token);

    // var xhr = new XMLHttpRequest();
    // xhr.open('POST', 'https://sage-savings.com/tokensignin');

    var data = {
        idtoken: id_token
    };

    $.ajax({
        type: "POST",
        url: 'https://www.sage-savings.com/tokensignin', 
        data: JSON.stringify(data),
        dataType: "json",
        success: function(data, status) {
            alert(data[d]);
        },
        error: function() {
            alert("Error");
        }
    });
    
}