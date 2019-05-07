$(document).ready(function () {
    Vue.component('update-modal', {
        props: ['bi'],
        template: `
            <div id='updateModal' class='modal'>
                <div class="modal-content">
                    <h4>Edit '{{ bi.name }}' </h4>
                    Designate&nbsp;$
                    <div class="input-field inline short-input-field">
                        <input :id="'amount' + bi.id" class="validate" placeholder="0.00" type="number"
                            v-model="bi.amount">
                    </div>
                    &nbsp;every&nbsp;
                    <div class="input-field inline short-input-field">
                        <input :id="'numOfPeriods' + bi.id" class="validate short-input-field" placeholder="1"
                            type="number" v-model="bi.numOfPeriods">
                    </div>
                    &nbsp;
                    <div class="input-field inline short-input-field">
                        <select :id="'period' + bi.id" v-model="bi.periodId">
                            <option value="1">days</option>
                            <option value="2">week(s)</option>
                            <option value="3">month(s)</option>
                            <option value="4">quarter(s)</option>
                            <option value="5">year</option>
                        </select>
                    </div>
                    &nbsp;for&nbsp;
                    <div class="input-field inline">
                        <input type="text" class="validate short-input-field" placeholder="expense"
                            v-model="bi.name">
                    </div>
                    <div id="updateTags" class="chips chips-initial"></div>
                </div>
                <div class="modal-footer">
                    <a class="modal-close waves-effect waves-green btn-flat"
                        v-on:click="$emit('save', bi)">Save</a>
                    <a class="modal-close waves-effect waves-green btn-flat">Cancel</a>
                </div>
            </div>
        `,
        watch: {
            bi: function() {

            }
        }
    });

    const app = new Vue({
        el: '#app',
        data: {
            user: user,
            budgetItemsToDelete: new Array(),
            budgetItemToCreate: { userId: user.id, tags: new Array() },
            budgetItemToUpdate: {}
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

            //Update tags
            M.Chips.init(document.querySelector('#updateTags'), {
                autocompleteOptions: autocompleteOptions
            });

            //Select
            M.FormSelect.init(document.querySelectorAll('select'), {});

            //Carousel
            M.Carousel.init(document.querySelector('#budgetsCarousel'), {
                fullWidth: true,
                indicators: true
            });

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
                const tagNames = new Array();
                const chips = M.Chips.getInstance(document.querySelector(budgetItem.id ? '#updateTags' : '#addNewTags'));
                for (let i = 0; i < chips.chipsData.length; i++)
                    tagNames.push(chips.chipsData[i].tag);
                budgetItem.tags = getTagsFromNames(tagNames);
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
                if (budgetItem == this.budgetItemToCreate)
                    this.budgetItemToCreate = { userId: user.id, tags: new Array() };
                else if (budgetItem == this.budgetItemToUpdate)
                    this.budgetItemToUpdate = {};
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
                    complete: function () {
                        $vm.budgetItemsToDelete.length = 0;
                    }
                });
            },
            setBudgetItemToUpdate: function (budgetItem) {
                this.budgetItemToUpdate = Object.assign({}, budgetItem);
                const tempTags = new Array();
                //Put chips in modal
                //Autocomplete options
                const autocompleteOptions = { data: new Object() };
                for (let i = 0; i < user.tags.length; i++)
                    autocompleteOptions.data[user.tags[i].name] = null;
                for (let i = 0; i < this.budgetItemToUpdate.tags.length; i++)
                    tempTags.push({ tag: this.budgetItemToUpdate.tags[i].name });
                M.Chips.init(document.querySelector('#updateTags'), {
                    data: tempTags,
                    autocompleteOptions: autocompleteOptions,
                    placeholder: 'Add tags',
                    secondaryPlaceholder: 'Add more tags'
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
            },
            getFormattedCurrency: function (amount) {
                return numeral(amount).format('$0,0.00');
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
            const weekChartMobile = new google.visualization.PieChart(document.getElementById('weekChartMobile'));
            weekChartMobile.draw(dataWeek, weekOptions);

            const dataMonth = google.visualization.arrayToDataTable(budgetDataMonth);
            const monthOptions = {
                pieHole: 0.4,
            };
            const monthChart = new google.visualization.PieChart(document.getElementById('monthChart'));
            monthChart.draw(dataMonth, monthOptions);
            const monthChartMobile = new google.visualization.PieChart(document.getElementById('monthChartMobile'));
            monthChartMobile.draw(dataMonth, monthOptions);

            const dataQuarter = google.visualization.arrayToDataTable(budgetDataQuarter);
            const quarterOptions = {
                pieHole: 0.4,
            };
            const quarterChart = new google.visualization.PieChart(document.getElementById('quarterChart'));
            quarterChart.draw(dataQuarter, quarterOptions);
            const quarterChartMobile = new google.visualization.PieChart(document.getElementById('quarterChartMobile'));
            quarterChartMobile.draw(dataQuarter, quarterOptions);

            const dataYear = google.visualization.arrayToDataTable(budgetDataYear);
            const yearOptions = {
                pieHole: 0.4,
            };
            const yearChart = new google.visualization.PieChart(document.getElementById('yearChart'));
            yearChart.draw(dataYear, yearOptions);
            const yearChartMobile = new google.visualization.PieChart(document.getElementById('yearChartMobile'));
            yearChartMobile.draw(dataYear, yearOptions);
        }
    }
});
