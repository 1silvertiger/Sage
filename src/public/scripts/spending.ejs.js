$(document).ready(function () {
    const app = new Vue({
        el: '#app',
        data: {
            user: user,
            budgetToShow: 'week'
        },
        mounted: function () {
            //Selects
            M.FormSelect.init(document.querySelector('#budgetSelect', new Object()));

            this.drawSpendingVsBudgetChart();
        },
        methods: {
            drawSpendingVsBudgetChart: function () {
                const $vm = this;
                google.charts.load('current', { packages: ['corechart', 'bar'] });
                google.charts.setOnLoadCallback(drawStacked);

                function drawStacked() {
                    const tempData = [
                        ['Budget', 'Spending', { role: "style" }, 'Budget', { role: "style" }]
                    ];

                    switch ($vm.budgetToShow) {
                        case 'week':
                            for (const entry of budgetItemsToTransactionItems[0].values())
                                tempData.push(getEntryArray(entry));
                            break;
                        case 'month':
                        for (const entry of budgetItemsToTransactionItems[1].values())
                        tempData.push(getEntryArray(entry));
                            break;
                        case 'quarter':
                        for (const entry of budgetItemsToTransactionItems[2].values())
                                tempData.push(getEntryArray(entry));
                            break;
                        case 'year':
                        for (const entry of budgetItemsToTransactionItems[3].values())
                                tempData.push(getEntryArray(entry));
                            break;
                    }

                    // var data = google.visualization.arrayToDataTable([
                    //     ['Budget', 'Spending', 'Budget'],
                    //     ['New York City, NY', 8175000, 8008000],
                    //     ['Los Angeles, CA', 3792000, 3694000],
                    //     ['Chicago, IL', 2695000, 2896000],
                    //     ['Houston, TX', 2099000, 1953000],
                    //     ['Philadelphia, PA', 1526000, 1517000]
                    // ]);

                    const data = google.visualization.arrayToDataTable(tempData);

                    var options = {
                        title: '',
                        chartArea: { width: '50%' },
                        isStacked: true,
                        hAxis: {
                            title: 'Spending',
                            minValue: 0,
                        },
                        vAxis: {
                            title: 'Budget item'
                        }
                    };
                    var chart = new google.visualization.BarChart(document.getElementById('spendingVsBudgetChart'));
                    chart.draw(data, options);
                }
            }
        },
        watch: {
            budgetToShow: function() {
                this.drawSpendingVsBudgetChart();
            }
        },
        computed: {

        }
    });
});

function getEntryArray(entry) {
    return [
        entry.name,
        entry.total,
        entry.total < entry.amount ? 'color: #81c784' : 'color: #e57373',
        entry.amount - entry.total > 0 ? entry.amount - entry.total : 0,
        'opacity: 0.5; color: #81c784'
    ];
}