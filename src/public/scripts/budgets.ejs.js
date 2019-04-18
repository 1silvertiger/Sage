$(document).ready(function () {
    const table = new Vue({
        el: '#app',
        data: {
            user: user,
            budgetItemsToDelete: new Array(),
            budgetItemToCreate: { userId: user.id, tags: new Array() }
        },
        mounted: function () {
            const $vm = this;

            //Initialize modals
            M.Modal.init(document.querySelectorAll('.modal'), { preventScrolling: true });

            //Chips
            //Autocomplete options
            const autocompleteOptions = { data: new Object() };
            for (let i = 0; i < user.tags.length; i++)
                autocompleteOptions.data[user.tags[i].name] = null;

            //Add new tags
            M.Chips.init(document.querySelector('#addNewTags'), {
                autocompleteOptions: autocompleteOptions
            });

            //Budget item modal tags
            for (let i = 0; i < user.budgetItems.length; i++) {
                //Get existing tags
                const chips = new Array();
                for (let j = 0; j < user.budgetItems[i].tags.length; j++)
                    chips.push({ tag: user.budgetItems[i].tags[j].name });
                //Initialize chips
                M.Chips.init(document.querySelector('#tags' + user.budgetItems[i].id), {
                    data: chips,
                    autocompleteOptions: autocompleteOptions
                });
            }

            //Select
            M.FormSelect.init(document.querySelectorAll('select'), {});

            //Draw charts
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
                if (budgetItem.id) {
                    const tagNames = new Array();
                    const chips = M.Chips.getInstance(document.querySelector('#tags' + budgetItem.id));
                    for (let i = 0; i < chips.chipsData.length; i++)
                        tagNames.push(chips.chipsData[i].tag);
                    budgetItem.tags = getTagsFromNames(tagNames);
                } else {
                    const tagNames = new Array();
                    const chips = M.Chips.getInstance(document.querySelector('#addNewTags'));
                    for (let i = 0; i < chips.chipsData.length; i++)
                        tagNames.push(chips.chipsData[i].tag);
                    budgetItem.tags = getTagsFromNames(tagNames);
                }
                $.ajax({
                    url: URL + '/createOrUpdateBudgetItem'
                    , type: 'POST'
                    , data: JSON.stringify({ budget: budgetItem })
                    , dataType: 'json'
                    , contentType: 'application/json'
                    , success: function (data) {
                        refreshUser().then(refreshedUser => {
                            drawOverviewChart();
                        }).catch(err => { console.log(err) });
                    }, error: function (jqxhr, status, error) {
                        let i = 0;
                    }
                });
            },
            deleteBudgetItems: function (budgetItemIds) {
                const $vm = this;
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
                    },
                    complete: function() {
                        $vm.budgetItemsToDelete.length = 0;
                    }
                });
            },
            addTagsFromChips: function (budgetItem) {
                const chips = M.Chips.getInstance(document.querySelector('#tags' + budgetItem.id));
                const chip = chips.chipsData[chips.chipsData.length - 1];
                budgetItem.tags.push({ id: getTagId(chip.tag), name: chip.tag, userId: user.id });
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
