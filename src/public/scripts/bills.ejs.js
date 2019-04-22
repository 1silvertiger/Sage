$(document).ready(function () {
    $('tr td').click(function() {
        $(this).parent().next().toggle();
    });

    Vue.component('bill-carousel', {
        props: ['bill', 'user'],
        data: function () {
            return {
                billNotificationToCreate: new Object()
            }
        },
        mounted: function () {
            const $vm = this;

            //Datepicker
            M.Datepicker.init(document.querySelector('#editDueDate'), {
                autoClose: true,
                defaultDate: new Date($vm.bill.dueDate),
                minDate: new Date(),
                format: 'mmmm dd, yyyy',
                onClose: function () {
                    $vm.bill.dueDate = appendTime(this.toString());
                }
            });

            //Carousel
            M.Carousel.init(document.querySelector('#billCarousel' + $vm.bill.id), {
                fullWidth: true,
                indicators: false,
                padding: 10
            });
        },
        template: `
            <div class="card-panel">
                <span class='card-title'>Edit {{ bill.name }}</span>
                <div :id="'billCarousel' + bill.id" class="carousel carousel-slider">
                    <!-- Bill details -->
                    <div class="carousel-item">
                        <div class="card">
                            <div class="card-content">
                                <span class="card-title">Bill details</span>
                                <div class="input-field med-input-field">
                                    <input type="text" id="editName" class="validate"
                                        v-model="bill.name">
                                    <label for="editName">Name</label>
                                </div>
                                <div class="input-field med-input-field">
                                    <input type="number" id="editAmount" class="validate"
                                        v-model="bill.amount">
                                    <label for="editAmount">Amount</label>
                                </div>
                                <input id="editDueDate" type="text" class="datepicker">
                                <label for="editDueDate">Due date</label>
                            </div>
                            <div class="card-action">
                                <a id="autopayBtn" class="waves-effect btn green lighten-2 hide"
                                    onclick="prevAddCarouselItem();">Back</a>
                                <a class="waves-effect btn green lighten-2" onclick="nextAddCarouselItem();">More</a>
                            </div>
                        </div>
                    </div>
                    <!-- Noticifations -->
                    <div class="carousel-item">
                        <div class="card">
                            <div class="card-content">
                                <span class="card-title">Notifications</span>
                                <table class="striped highlight">
                                    <thead>
                                        <th colspan="2">Periods before bill is due:</th>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(n, i) in bill.notifications">
                                            <td>{{ n.periodsBeforeBillIsDue }}</td>
                                            <td>{{ getSemanticPeriod(n.periodId) }}</td>
                                            <td><a class="waves-effect btn-flat" v-on:click="bill.notifications.splice(i,1);">Remove</a></td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div class="input-field">
                                                    <input
                                                        v-model="billNotificationToCreate.periodsBeforeBillIsDue"
                                                        id="editNotificationNumber" type="number"
                                                        class="validate">
                                                    <label for="editNotificationNumber"></label>
                                                </div>
                                            </td>
                                            <td>
                                                <select v-model="billNotificationToCreate.periodId">
                                                    <option value="1">day(s)</option>
                                                    <option value="2">week(s)</option>
                                                    <option value="3">month(s)</option>
                                                    <option value="4">quarter(s)</option>
                                                    <option value="5">year(s)</option>
                                                </select>
                                                <label>Notification cycle</label>
                                            </td>
                                            <td>
                                                <a class="waves-effect btn-flat" v-on:click="bill.notifications.push(billNotificationToCreate)">Add</a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="card-action">
                                <a class="waves-effect btn green lighten-2" onclick="prevAddCarouselItem();">Back</a>
                                <a class="waves-effect btn green lighten-2" onclick="nextAddCarouselItem();">More</a>
                            </div>
                        </div>
                    </div>
                    <!-- Bill cycle -->
                    <div class="carousel-item">
                        <div class="card">
                            <div class="card-content">
                                <span class="card-title">Bill cycle</span>
                                This bill repeats every
                                <div class="input-field inline">
                                    <input v-model="bill.numOfPeriods" id="editNumOfPeriods"
                                        type="number" class="validate">
                                    <label for="#editNumOfPeriods"></label>
                                </div>
                                <div class="input-field inline">
                                    <select v-model="bill.periodId">
                                        <option value="1">day(s)</option>
                                        <option value="2">week(s)</option>
                                        <option value="3">month(s)</option>
                                        <option value="4">quarter(s)</option>
                                        <option value="5">year(s)</option>
                                    </select>
                                </div>
                                <p>
                                    <label>
                                        <input type="checkbox" id="editWeekDay" class="filled-in"
                                            v-model="bill.weekDay">
                                        <span>If the due date falls on a weekend, this bill is due the following
                                            Monday.</span>
                                    </label>
                                </p>
                            </div>
                            <div class="card-action">
                                <a class="waves-effect btn green lighten-2" onclick="prevAddCarouselItem();">Back</a>
                                <a class="waves-effect btn green lighten-2" onclick="nextAddCarouselItem();">More</a>
                            </div>
                        </div>
                    </div>
                    <!-- Autopay -->
                    <div class="carousel-item">
                        <div class="card">
                            <div class="card-content">
                                <span class="card-title">Autopay</span>
                                This bill is on autopay from the following account:
                                <div class="input-field">
                                    <select v-model="bill.accountId">
                                        <optgroup v-for="item in user.items" :label="item.institutionName">
                                            <option v-for="a in item.accounts" :value="a.id">{{ a.name }}</option>
                                        </optgroup>
                                    </select>
                                </div>
                            </div>
                            <div class="card-action">
                                <a class="waves-effect btn green lighten-2" onclick="prevAddCarouselItem();">Back</a>
                                <a class="waves-effect btn green lighten-2" onclick="nextAddCarouselItem();">More</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    });
    const app = new Vue({
        el: '#app',
        data: {
            user: user,
            billsToDelete: new Array(),
            billToCreate: { userId: user.id, autoPay: false, weekDay: false, notifications: new Array() },
            billToUpdate: new Object(),
            billNotificationToCreate: {}
        },
        mounted: function () {
            const $vm = this;

            //Modals
            // M.Modal.init(document.querySelectorAll('.modal'), { preventScrolling: true });

            //Carousel
            M.Carousel.init(document.querySelector('#addBillCarousel'), {
                fullWidth: true,
                indicators: false,
                padding: 10,
                onCycleTo: function () {
                    $('#autopayBtn').removeClass('hide');
                }
            });

            //Datepickers
            const addDueDateOptions = {
                autoClose: true,
                defaultDate: new Date(),
                minDate: new Date(),
                format: 'mmmm dd, yyyy',
                onClose: function () {
                    $vm.billToCreate.dueDate = appendTime(this.toString());
                }
            }
            M.Datepicker.init(document.querySelector('#addDueDate'), addDueDateOptions);

            //Selects
            M.FormSelect.init(document.querySelectorAll('select'), {});

            //Collapsibles
            // M.Collapsible.init(document.querySelector('#billsAccordion'), {

            // });
        },
        methods: {
            getSemanticPeriod: function (periodId) {
                const temp = getSemanticPeriod(periodId);
                return temp;
            },
            createOrUpdateBill: function (bill) {
                $.ajax({
                    url: URL + '/createOrUpdateBill',
                    type: 'POST',
                    data: JSON.stringify({ bill: bill }),
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function (newBill) {
                        refreshUser().catch(err => {
                            user.bills.push(JSON.parse(newBill));
                        });
                    },
                    error: function (jqxhr, status, error) {
                        let i = 0;
                    }
                });
            },
            deleteBills: function (ids) {
                $.ajax({
                    url: URL + '/deleteBills',
                    type: 'POST',
                    data: JSON.stringify({ ids: ids }),
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function (refreshedUser) {
                        user.items = refreshedUser.items;
                        user.budgetItems = refreshedUser.budgetItems;
                        user.piggyBanks = refreshedUser.piggyBanks;
                        user.bills = refreshedUser.bills;
                    },
                    error: function (jqxhr, status, error) {
                        let i = 0;
                    }
                });
            },
            addNotificationToCreate: function () {
                billToCreate.notifications.push(billNotificationToCreate);
                billNotificationToCreate = new Object();
            },
            setBillToUpdate: function (bill) {
                this.billToUpdate = Object.assign(new Object(), bill);
            },
            getFormattedDate: function (date) {
                return moment(date).format('MMM DD, YYYY');
            },
            getFormattedCurrency: function (amount) {
                return numeral(amount).format('$0,0.00');
            }
        },
        computed: {
            lateBills: function () {
                // return user.bills.filter(bill => (bill.dueDate > new Date()) - (bill.dueDate < new Date()));
                return user.bills.filter(bill => {
                    const now = new Date();
                    const temp = new Date(bill.dueDate) < now;
                    return temp;
                });
            }
        }
    });
});

function prevAddCarouselItem() {
    const carousel = M.Carousel.getInstance(document.querySelector('#addBillCarousel'));
    carousel.prev();
}

function nextAddCarouselItem() {
    const carousel = M.Carousel.getInstance(document.querySelector('#addBillCarousel'));
    carousel.next();
}

function appendTime(dateFromPicker) {
    return new Date(dateFromPicker.concat(' 00:00:00'));
}

