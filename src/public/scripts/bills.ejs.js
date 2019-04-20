$(document).ready(function () {
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

            //Carousel
            M.Carousel.init(document.querySelector('#addBillCarousel'), {
                fullWidth: true,
                indicators: false,
                padding: 10,
                onCycleTo: function() {
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
        },
        methods: {
            getSemanticPeriod: function(periodId) {
                return getSemanticPeriod(periodId);
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
            addNotificationToCreate: function() {
                billToCreate.notifications.push(billNotificationToCreate);
                billNotificationToCreate = new Object();
            },
            getFormattedDate: function (date) {
                return moment(date).format('MMM DD, YYYY');
            },
            getFormattedCurrency: function(amount) {
                return numeral(amount).format('$0,0.00');
            }
        },
        computed: {
            lateBills: function () {
                // return user.bills.filter(bill => (bill.dueDate > new Date()) - (bill.dueDate < new Date()));
                return user.bills.filter(bill => {
                    const now = new Date();
                    const temp = new Date(bill.dueDate) < now; 
                    return  temp;
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

