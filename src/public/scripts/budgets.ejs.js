let overviewSelector;
let addNewSelector;

$(document).ready(function () {
    const table = new Vue({
        el: '#app',
        data: {
            user: user,
            budgetItemsToDelete: new Array(),
            budgetItemToCreate: new ClientBudget(null, user.id, 3, null, null, null)
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
        computed: {
            sortedBudgetItems: function () {
                return user.budgetItems.sort((a, b) => {
                    const temp1 = a.name.toUpperCase();
                    const temp2 = b.name.toUpperCase();
                    if (temp1 > temp2)
                        return 1
                    else if (temp1 < temp2)
                        return -1;
                    else
                        return 0;
                });
            }
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
                        drawOverviewChart();
                    }
                });
            },
            getPeriodName: function (periodId) {
                switch (periodId) {
                    case 1:
                        return 'day';
                    case 2:
                        return 'week';
                    case 3:
                        return 'month';
                    case 4:
                        return 'quarter';
                    case 5:
                        return 'year';

                }
            }
        }
    });

    function drawOverviewChart() {
        //Create chart
        google.charts.load("current", { packages: ["corechart"] });
        google.charts.setOnLoadCallback(drawChart);
        function drawChart() {
            const budgetDataWeek = new Array();
            const budgetDataMonth = new Array();
            const budgetDataQuarter = new Array();
            const budgetDataYear = new Array();
            budgetDataWeek.push(['Expense', 'Amount']);
            budgetDataMonth.push(['Expense', 'Amount']);
            budgetDataQuarter.push(['Expense', 'Amount']);
            budgetDataYear.push(['Expense', 'Amount']);
            for (let i = 0; i < user.budgetItems.length; i++) {
                if (user.budgetItems[i].periodId === 2)
                    budgetDataWeek.push([user.budgetItems[i].name, user.budgetItems[i].amount / user.budgetItems[i].numOfPeriods]);
                if (user.budgetItems[i].periodId === 3)
                    budgetDataMonth.push([user.budgetItems[i].name, user.budgetItems[i].amount / user.budgetItems[i].numOfPeriods]);
                if (user.budgetItems[i].periodId === 4)
                    budgetDataQuarter.push([user.budgetItems[i].name, user.budgetItems[i].amount / user.budgetItems[i].numOfPeriods]);
                if (user.budgetItems[i].periodId === 5)
                    budgetDataYear.push([user.budgetItems[i].name, user.budgetItems[i].amount / user.budgetItems[i].numOfPeriods]);
            }

            const dataWeek = google.visualization.arrayToDataTable(budgetDataWeek);
            const weekOptions = {
                pieHole: 0.4,
            };
            const weekChart = new google.visualization.PieChart(document.getElementById('weekChart'));
            weekChart.draw(dataWeek, weekOptions);

            const dataMonth = google.visualization.arrayToDataTable(budgetDataMonth);
            const monthOptions = {
                pieHole: 0.4,
            };
            const monthChart = new google.visualization.PieChart(document.getElementById('monthChart'));
            monthChart.draw(dataMonth, monthOptions);

            const dataQuarter = google.visualization.arrayToDataTable(budgetDataQuarter);
            const quarterOptions = {
                pieHole: 0.4,
            };
            const quarterChart = new google.visualization.PieChart(document.getElementById('quarterChart'));
            quarterChart.draw(dataQuarter, quarterOptions);

            const dataYear = google.visualization.arrayToDataTable(budgetDataYear);
            const yearOptions = {
                pieHole: 0.4,
            };
            const yearChart = new google.visualization.PieChart(document.getElementById('yearChart'));
            yearChart.draw(dataYear, yearOptions);
        }
    }
});
