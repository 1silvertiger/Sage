$(document).ready(function () {

    Vue.component('bill-carousel', {
        props: ['bill', 'user'],
        data: function () {
            return {
                billNotificationToCreate: new Object(),
                billToUpdate: Object.assign(new Object(), this.bill),
                onceAround: false
            }
        },
        mounted: function () {
            const $vm = this;

            //Datepicker
            M.Datepicker.init(document.querySelector('#editDueDate' + $vm.bill.id), {
                autoClose: true,
                setDefaultDate: true,
                defaultDate: new Date($vm.bill.dueDate),
                minDate: new Date($vm.bill.dueDate) < new Date() ? new Date($vm.bill.dueDate) : new Date(),
                format: 'mmmm dd, yyyy',
                container: document.querySelector('#app'),
                onClose: function () {
                    $vm.bill.dueDate = appendTime(this.toString());
                }
            });

            //Carousel
            M.Carousel.init(document.querySelector('#editBillCarousel' + $vm.bill.id), {
                fullWidth: true,
                indicators: false,
                padding: 10
            });

            $vm.onceAround = false;
        },
        methods: {
            prevCarouselItem: function() {
                $vm = this;
                const carousel = M.Carousel.getInstance(document.querySelector('#editBillCarousel' + $vm.bill.id));
                carousel.prev();
            },
            nextCarouselItem: function () {
                $vm = this;
                const carousel = M.Carousel.getInstance(document.querySelector('#editBillCarousel' + $vm.bill.id));
                carousel.next();
            },
            cancel: function() {
                $vm = this;
                $vm.billToUpdate = Object.assign(new Object(), $vm.bill);
                const carousel = M.Carousel.getInstance(document.querySelector('#editBillCarousel' + $vm.bill.id));
                carousel.set(0);
            },
            getSemanticPeriod: function (periodId) {
                const temp = getSemanticPeriod(periodId);
                return temp;
            },
        },
        template: `
        <div class="card">
        <div class="card-content">
                <span class='card-title'>Edit {{ bill.name }}</span>
                <div :id="'editBillCarousel' + bill.id" class="carousel carousel-slider">
                    <!-- Bill details -->
                    <div class="carousel-item">
                        <div class="card">
                            <div class="card-content">
                                <span class="card-title">Bill details</span>
                                <div class="input-field med-input-field">
                                    <input type="text" :id="'editName' + bill.id" class="validate" v-model="billToUpdate.name">
                                    <label :for="'editName' + bill.id" class="active">Name</label>
                                </div>
                                <div class="input-field med-input-field">
                                    <input type="number" :id="'editAmount' + bill.id" class="validate" v-model="billToUpdate.amount">
                                    <label for="editAmount" class="active">Amount</label>
                                </div>
                                <input :id="'editDueDate' + bill.id" type="text" class="datepicker">
                                <label for="editDueDate">Due date</label>
                            </div>
                            <div class="card-action">
                                <a v-show="onceAround" class="waves-effect btn green lighten-2" v-on:click="prevCarouselItem();">Back</a>
                                <a class="waves-effect btn green lighten-2" v-on:click="nextCarouselItem();">More</a>
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
                                        <tr v-for="(n, i) in billToUpdate.notifications">
                                            <td>{{ n.periodsBeforeBillIsDue }}</td>
                                            <td>{{ getSemanticPeriod(n.periodId) }}</td>
                                            <td><a class="waves-effect btn-flat"
                                                    v-on:click="billToUpdate.notifications.splice(i,1);">Remove</a></td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div class="input-field">
                                                    <input v-model="billNotificationToCreate.periodsBeforeBillIsDue"
                                                        :id="'editNotificationNumber' + bill.id" type="number" class="validate">
                                                    <label :for="'editNotificationNumber'  + bill.id"></label>
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
                                                <a class="waves-effect btn-flat"
                                                    v-on:click="billToUpdate.notifications.push(billNotificationToCreate); billNotificationToCreate = new Object();">Add</a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="card-action">
                                <a class="waves-effect btn green lighten-2" v-on:click="prevCarouselItem();">Back</a>
                                <a class="waves-effect btn green lighten-2" v-on:click="nextCarouselItem();">More</a>
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
                                    <input :id="'editNumOfPeriods' + bill.id" v-model="billToUpdate.numOfPeriods" type="number" class="validate">
                                    <label :for="'editNumOfPeriods' + bill.id"></label>
                                </div>
                                <div class="input-field inline">
                                    <select v-model="billToUpdate.periodId">
                                        <option value="1">day(s)</option>
                                        <option value="2">week(s)</option>
                                        <option value="3">month(s)</option>
                                        <option value="4">quarter(s)</option>
                                        <option value="5">year(s)</option>
                                    </select>
                                </div>
                                <p>
                                    <label>
                                        <input type="checkbox" :id="'editWeekDay' + bill.id" class="filled-in" v-model="billToUpdate.weekDay">
                                        <span>If the due date falls on a weekend, this bill is due the following
                                            Monday.</span>
                                    </label>
                                </p>
                            </div>
                            <div class="card-action">
                                <a class="waves-effect btn green lighten-2" v-on:click="prevCarouselItem();">Back</a>
                                <a class="waves-effect btn green lighten-2" v-on:click="nextCarouselItem();">More</a>
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
                                    <select v-model="billToUpdate.accountId">
                                        <optgroup v-for="item in user.items" :label="item.institutionName">
                                            <option v-for="a in item.accounts" :value="a.id">{{ a.name }}</option>
                                        </optgroup>
                                    </select>
                                </div>
                            </div>
                            <div class="card-action">
                                <a class="waves-effect btn green lighten-2" v-on:click="prevCarouselItem();">Back</a>
                                <a class="waves-effect btn green lighten-2" v-on:click="nextCarouselItem(); onceAround = true;">More</a>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
        <div class="card-action">
            <a class="btn green lighten-2" v-on:click="$emit('save', billToUpdate)">Save</a>
            <a class="btn green lighten-2" v-on:click="cancel()">Cancel</a>
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
            billNotificationToCreate: {},
            onceAround: false
        },
        mounted: function () {
            const $vm = this;

            //Modals
            // M.Modal.init(document.querySelectorAll('.modal'), { preventScrolling: true });

            //Carousel
            M.Carousel.init(document.querySelector('#addBillCarousel'), {
                fullWidth: true,
                indicators: false,
                padding: 10
            });

            //Datepickers
            const addDueDateOptions = {
                autoClose: true,
                defaultDate: new Date(),
                minDate: new Date(),
                format: 'mmmm dd, yyyy',
                container: document.querySelector('#app'),
                onClose: function () {
                    $vm.billToCreate.dueDate = appendTime(this.toString());
                }
            }
            M.Datepicker.init(document.querySelector('#addDueDate'), addDueDateOptions);

            //Selects
            M.FormSelect.init(document.querySelectorAll('select'), {});
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
                if (bill.id === this.billToUpdate.id)
                    this.billToUpdate = new Object();
                else
                    this.billToUpdate = Object.assign(new Object(), bill);
            },
            getFormattedDate: function (date) {
                return moment(date).format('MMM DD, YYYY');
            },
            getFormattedCurrency: function (amount) {
                return numeral(amount).format('$0,0.00');
            }
        },
        // computed: {
        //     lateBills: function () {
        //         // return user.bills.filter(bill => (bill.dueDate > new Date()) - (bill.dueDate < new Date()));
        //         return user.bills.filter(bill => {
        //             const now = new Date();
        //             const temp = new Date(bill.dueDate) < now;
        //             return temp;
        //         });
        //     }
        // }
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

