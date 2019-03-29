let overviewSelector;
let addNewSelector;

$(document).ready(function () {
    M.AutoInit();
    // addNewSelector = M.FormSelect.getInstance(document.querySelector("#period"));
    // overviewSelector = M.FormSelect.getInstance(document.querySelector("#overviewSelector"));

    if (user.budgetItems.length > 0)
        drawOverviewChart();

    const table = new Vue({
        el: '#table'
        , data: {
            user: user
        }
    });

    $('#addNewBudgetBtn').click(function () {
        const temp = $('#expense');
        const budget = new ClientBudget(
            null
            , user.id
            , M.FormSelect.getInstance(document.querySelector("#period")).getSelectedValues()[0]
            , $('#expense').val()
            , $('#amount').val()
            , $('#numOfPeriods').val()
        );

        $.ajax({
            url: URL + '/createBudget'
            , type: 'POST'
            , data: JSON.stringify({ budget: budget })
            , dataType: 'json'
            , contentType: 'application/json'
            , success: function (data) {
                //clear form
                refreshUser().then(refreshedUser => {
                    drawOverviewChart();
                }).catch(err => { console.log(err) });
            }, error: function (jqxhr, status, error) {
                let i = 0;
            }
        });
    });
});

function drawOverviewChart() {
    //Create chart
    google.charts.load("current", { packages: ["corechart"] });
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
        const budgetData = new Array();
        budgetData.push(['Expense', 'Amount']);
        for (let i = 0; i < user.budgetItems.length; i++) {
            // if (user.budgetItems[i].periodId === overviewSelector.getSelectedValues()[0])
                budgetData.push([user.budgetItems[i].name, user.budgetItems[i].amount / user.budgetItems[i].numOfPeriods]);
        }

        const data = google.visualization.arrayToDataTable(budgetData);

        var options = {
            title: 'Monthly budget',
            pieHole: 0.4,
        };

        var chart = new google.visualization.PieChart(document.getElementById('overviewChart'));
        chart.draw(data, options);
    }
}
