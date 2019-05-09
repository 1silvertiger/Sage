$(document).ready(function () {
    const app = new Vue({
        el: '#app',
        data: {
            user: user,
            budgetToShow: 'week',
            fromDate: moment().startOf('week').toDate(),
            toDate: moment().toDate(),
            tagsTotals: tagsTotals
        },
        mounted: function () {
            $vm = this;
            //Selects
            M.FormSelect.init(document.querySelector('#budgetSelect', new Object()));

            //Date pickers
            M.Datepicker.init(document.querySelector('#from'), {
                autoClose: true,
                defaultDate: moment().startOf('week').toDate(),
                setDefaultDate: true,
                minDate: moment().startOf('year').toDate(),
                container: document.querySelector('#app'),
                onSelect: function (newDate) {
                    $vm.fromDate = newDate;
                    $vm.getTagsTotals();
                }
            });
            M.Datepicker.init(document.querySelector('#to'), {
                autoClose: true,
                defaultDate: moment().toDate(),
                setDefaultDate: true,
                minDate: moment().startOf('year').add(1, 'weeks').toDate(),
                container: document.querySelector('#app'),
                onSelect: function (newDate) {
                    $vm.toDate = newDate;
                    $vm.getTagsTotals();
                }
            });

            this.drawSpendingVsBudgetChart();
            this.drawSpendingByTagsChart();
        },
        methods: {
            getTagsTotals: function () {
                const $vm = this;
                return new Promise(function(resolve, reject) {
                    $.ajax({
                        url: URL + '/getTagsTotals',
                        type: 'POST',
                        data: JSON.stringify({ 
                            fromDate: $vm.fromDate, 
                            toDate: $vm.toDate 
                        }),
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function(totals) {
                            $vm.tagsTotals = totals;
                            $vm.drawSpendingByTagsChart();
                        }
                    });
                });
            },
            drawSpendingByTagsChart: function () {
                const $vm = this;

                google.charts.load('current', { packages: ['corechart', 'bar'] });
                google.charts.setOnLoadCallback(drawStacked);

                function drawStacked() {
                    const tempData = [
                        ['Tag', 'Spending', { role: 'style' }]
                    ];

                    for (let i = 0; i < $vm.tagsTotals.length; i++) {
                        if ($vm.tagsTotals[i] > 0)
                            tempData.push([
                                user.tags[i].name,
                                $vm.tagsTotals[i],
                                'color: #81c784'
                            ]);
                    }

                    const data = google.visualization.arrayToDataTable(tempData);

                    var options = {
                        title: '',
                        chartArea: { width: '50%' },
                        hAxis: {
                            title: 'Spending',
                            minValue: 0,
                        },
                        vAxis: {
                            title: 'Tags'
                        },
                        legend: 'none'
                    };
                    var chart = new google.visualization.BarChart(document.getElementById('spendingByTagsChart'));
                    chart.draw(data, options);
                }
            },
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
                            for (let i = 0; i < user.budgetItems.length; i++)
                                if (user.budgetItems[i].periodId === 2)
                                    tempData.push(getEntryArray(user.budgetItems[i], budgetItemsTotals[i]));
                            tempData.push([
                                'Unbudgeted',
                                unbudgetedTotals[0],
                                'color: #e57373',
                                0,
                                'opacity: 1'
                            ]);
                            break;
                        case 'month':
                            for (let i = 0; i < user.budgetItems.length; i++)
                                if (user.budgetItems[i].periodId === 3)
                                    tempData.push(getEntryArray(user.budgetItems[i], budgetItemsTotals[i]));
                            tempData.push([
                                'Unbudgeted',
                                unbudgetedTotals[1],
                                'color: #e57373',
                                0,
                                'opacity: 1'
                            ]);
                            break;
                        case 'quarter':
                            for (let i = 0; i < user.budgetItems.length; i++)
                                if (user.budgetItems[i].periodId === 4)
                                    tempData.push(getEntryArray(user.budgetItems[i], budgetItemsTotals[i]));
                            tempData.push([
                                'Unbudgeted',
                                unbudgetedTotals[2],
                                'color: #e57373',
                                0,
                                'opacity: 1'
                            ]);
                            break;
                        case 'year':
                            for (let i = 0; i < user.budgetItems.length; i++)
                                if (user.budgetItems[i].periodId === 5)
                                    tempData.push(getEntryArray(user.budgetItems[i], budgetItemsTotals[i]));
                            tempData.push([
                                'Unbudgeted',
                                unbudgetedTotals[3],
                                'color: #e57373',
                                0,
                                'opacity: 1'
                            ]);
                            break;
                    }

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
                        },
                        legend: 'none'
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