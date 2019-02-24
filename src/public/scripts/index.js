var transactions = new Vue({
  el: '#transactions'
  , data: {
    transactions: []
  }
});

// var app = new Vue({
//     el: '#app',
//     data: {
//         accounts: []
//     }
// });

//Get transactions
var url1 = "https://e4d9e13e.ngrok.io/get-transactions";
var request1 = new XMLHttpRequest();
request1.onreadystatechange = function() {
  if (request1.readyState === XMLHttpRequest.DONE) {
    if (request1.status === 200) {
      var response = JSON.parse(request1.response);
      //var results = response.query.results;
      transactions.transactions = response.transactions.transactions;
      var i = 0;
    }
  } else {
    // Return the initial weather forecast since no data is available.
    //app.updateForecastCard(initialWeatherForecast);
  }
};
request1.open('GET', url1);
request1.send();

// //Get accounts
// var url = "http://localhost:8000/balance";
// var request = new XMLHttpRequest();
// request.onreadystatechange = function() {
//   if (request.readyState === XMLHttpRequest.DONE) {
//     if (request.status === 200) {
//       var response = JSON.parse(request.response);
//       //var results = response.query.results;
//       app.accounts = response.balance.accounts;
//     }
//   } else {
//     // Return the initial weather forecast since no data is available.
//     //app.updateForecastCard(initialWeatherForecast);
//   }
// };
// request.open('GET', url);
// request.send();

