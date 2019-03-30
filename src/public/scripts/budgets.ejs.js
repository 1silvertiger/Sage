let overviewSelector;
let addNewSelector;

$(document).ready(function () {
    const table = new Vue({
        el: '#app',
        data: {
            user: user,
            budgetItemsToDelete: new Array(),
            budgetItemToCreate: new ClientBudget(null, user.id, null, null, null, null)
        },
        mounted: function () {
            //Initialize modals
            M.Modal.init(document.querySelectorAll('.modal'), { preventScrolling: true });
            M.FormSelect.init(document.querySelectorAll('select'), {});
            addNewSelector = M.FormSelect.getInstance(document.querySelector('#period'));
            refreshUser().then(refreshedUser => {
                drawOverviewChart();
            }).catch(err => { console.log(err) });
        },
        methods: {
            createOrUpdateBudgetItem: function (budgetItem) {
                $.ajax({
                    url: URL + '/createOrUpdateBudgetItem'
                    , type: 'POST'
                    , data: JSON.stringify({ budget: budgetItem })
                    , dataType: 'json'
                    , contentType: 'application/json'
                    , success: function (data) {
                        refreshUser().then(refreshedUser => {
                            drawOverviewChart();
                            budgetItem = new ClientBudget(null, user.id, null, null, null, null);
                        }).catch(err => { console.log(err) });
                    }, error: function (jqxhr, status, error) {
                        let i = 0;
                    }
                });
            },
            deleteBudgetItems: function (budgetItemIds) {
                $.ajax({
                    url: URL + '/deleteBudgetItems',
                    type: 'POST',
                    data: JSON.stringify({ budgetItemIds: budgetItemIds }),
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function (refreshedUser) {
                        const temp = JSON.parse(refreshedUser);
                        user.items = temp.items;
                        user.budgetItems = temp.budgetItems;
                    }
                });
            }
        }
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
});
