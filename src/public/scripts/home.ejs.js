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
    $("#plaid").click(function () {
        handler.open();
    });

    const app = new Vue({
        el: '#app',
        data: {
            budgetChartToShow: 'week',
            user: user
        },
        mounted: function () {
            drawOverviewChart();
            this.drawPiggyBankChart();

            //Select
            M.FormSelect.init(document.querySelector('#budgetChartSelect', new Object()));

            // Carousel
            M.Carousel.init(document.querySelector('#currentBudgetCarousel'), {
                indicators: true,
                fullWidth: true
            });
        },
        watch: {
            budgetChartToShow: function (period) {
                this.drawChart(period);
            }
        },
        computed: {
            upcomingBills: function () {
                return user.bills.filter((a, b) => {
                    const firstDueDate = moment(a.dueDate);
                    const secondDueDate = moment(b.dueDate);
                    if (firstDueDate.isBefore(secondDueDate))
                        return -1;
                    else if (firstDueDate.isAfter(secondDueDate))
                        return 1;
                    else
                        return 0;
                }).slice(0, 6);
            },
            userFullName: function () {
                return user.firstName.concat(' ', user.lastName);
            }
        },
        methods: {
            getAccountFromId: function (id) {
                for (const item of user.items.values())
                    for (const account of item.accounts.values())
                        if (id === account.id)
                            return account.name;
                return null;
            },
            drawPiggyBankChart: function () {
                google.charts.load('current', { packages: ['gauge'] });
                google.charts.setOnLoadCallback(drawChart);

                function drawChart() {
                    for (const piggyBank of user.piggyBanks.values()) {
                        const tempData = [
                            ['Label', 'Value'],
                            [piggyBank.name, piggyBank.balance]
                        ];
                        const data = google.visualization.arrayToDataTable(tempData);
    
                        var options = {
                            width: 800, height: 240,
                            minorTicks: 10
                        };

                        if (piggyBank.goal >= piggyBank.balance) {
                            options.max = piggyBank.goal;
                        } else {
                            options.max = piggyBank.balance;
                            options.greenFrom = piggyBank.goal;
                            options.greenTo = piggyBank.balance;
                        }
    
                        var chart = new google.visualization.Gauge(document.getElementById('piggyBankChart' + piggyBank.id));
    
                        chart.draw(data, options);
                    }
                }
            },
            drawChart: function (period) {
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
                    if (period === 'week')
                        weekChart.draw(dataWeek, weekOptions);

                    const dataMonth = google.visualization.arrayToDataTable(budgetDataMonth);
                    const monthOptions = {
                        pieHole: 0.4,
                    };
                    const monthChart = new google.visualization.PieChart(document.getElementById('monthChart'));
                    if (period === 'month')
                        monthChart.draw(dataMonth, monthOptions);

                    const dataQuarter = google.visualization.arrayToDataTable(budgetDataQuarter);
                    const quarterOptions = {
                        pieHole: 0.4,
                    };
                    const quarterChart = new google.visualization.PieChart(document.getElementById('quarterChart'));
                    if (period === 'quarter')
                        quarterChart.draw(dataQuarter, quarterOptions);

                    const dataYear = google.visualization.arrayToDataTable(budgetDataYear);
                    const yearOptions = {
                        pieHole: 0.4,
                    };
                    const yearChart = new google.visualization.PieChart(document.getElementById('yearChart'));
                    if (period === 'year')
                        yearChart.draw(dataYear, yearOptions);
                }
            },
            getFormattedCurrency: function (amount) {
                return numeral(amount).format('$0,0.00');
            },
            getFormattedDate: function (date) {
                return moment(date).format('MMM DD, YYYY');
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
            // const weekChartMobile = new google.visualization.PieChart(document.getElementById('weekChartMobile'));
            // weekChartMobile.draw(dataWeek, weekOptions);

            const dataMonth = google.visualization.arrayToDataTable(budgetDataMonth);
            const monthOptions = {
                pieHole: 0.4,
            };
            const monthChart = new google.visualization.PieChart(document.getElementById('monthChart'));
            monthChart.draw(dataMonth, monthOptions);
            // const monthChartMobile = new google.visualization.PieChart(document.getElementById('monthChartMobile'));
            // monthChartMobile.draw(dataMonth, monthOptions);

            const dataQuarter = google.visualization.arrayToDataTable(budgetDataQuarter);
            const quarterOptions = {
                pieHole: 0.4,
            };
            const quarterChart = new google.visualization.PieChart(document.getElementById('quarterChart'));
            quarterChart.draw(dataQuarter, quarterOptions);
            // const quarterChartMobile = new google.visualization.PieChart(document.getElementById('quarterChartMobile'));
            // quarterChartMobile.draw(dataQuarter, quarterOptions);

            const dataYear = google.visualization.arrayToDataTable(budgetDataYear);
            const yearOptions = {
                pieHole: 0.4,
            };
            const yearChart = new google.visualization.PieChart(document.getElementById('yearChart'));
            yearChart.draw(dataYear, yearOptions);
            // const yearChartMobile = new google.visualization.PieChart(document.getElementById('yearChartMobile'));
            // yearChartMobile.draw(dataYear, yearOptions);
        }
    }
});