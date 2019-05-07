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
                        ['Budget item', 'Spent', { role: "style" }, 'Remaining', { role: "style" }]
                    ];

                    switch ($vm.budgetToShow) {
                        case 'week':
                            for (let i = 0; i < budgetItemsToTransactionItems.length; i++)
                                if (user.budgetItems[i].periodId === 2)
                                    tempData.push(getEntryArray(user.budgetItems[i], budgetItemsToTransactionItems[i]));
                            break;
                        case 'month':
                            for (let i = 0; i < budgetItemsToTransactionItems.length; i++)
                                if (user.budgetItems[i].periodId === 3)
                                    tempData.push(getEntryArray(user.budgetItems[i], budgetItemsToTransactionItems[i]));
                            break;
                        case 'quarter':
                            for (let i = 0; i < budgetItemsToTransactionItems.length; i++)
                                if (user.budgetItems[i].periodId === 4)
                                    tempData.push(getEntryArray(user.budgetItems[i], budgetItemsToTransactionItems[i]));
                            break;
                        case 'year':
                            for (let i = 0; i < budgetItemsToTransactionItems.length; i++)
                                if (user.budgetItems[i].periodId === 5)
                                    tempData.push(getEntryArray(user.budgetItems[i], budgetItemsToTransactionItems[i]));
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
            budgetToShow: function () {
                this.drawSpendingVsBudgetChart();
            }
        },
        computed: {

        }
    });
});

function getEntryArray(budgetItem, total) {
    if (total < budgetItem.amount)
        return [
            budgetItem.name,
            total,
            'color: #81c784',
            budgetItem.amount - total,
            'opacity: 0.5; color: #81c784'
        ];
    else
        return [
            budgetItem.name,
            budgetItem.amount,
            'color: #81c784',
            total - budgetItem.amount,
            'color: #e57373'
        ];
}