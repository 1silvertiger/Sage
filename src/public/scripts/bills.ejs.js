$(document).ready(function () {
    const app = new Vue({
        el: '#app',
        data: {
            user: user,
            billsToDelete: new Array(),
            billToCreate: { userId: user.id, autoPay: false, weekDay: false, tag: {} },
            billToCreateRepeats: false
        },
        mounted: function () {
            const $vm = this;

            //Collapsible
            const collapsibleOptions = {
                accordion: false,
                onOpenEnd: function () {
                    if (!$vm.billToCreateRepeats){
                        this.close(1);
                    } 
                    if (!$vm.billToCreate.autoPay){
                        this.close(2);
                    }
                }
            }
            M.Collapsible.init(document.querySelectorAll('.collapsible'), collapsibleOptions);

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

            const addDueDate2Options = {
                autoClose: true,
                defaultDate: new Date(),
                minDate: new Date(),
                format: 'mmmm dd, yyyy',
                onClose: function () {
                    $vm.billToCreate.dueDate2 = appendTime(this.toString());
                }
            }
            M.Datepicker.init(document.querySelector('#addDueDate2'), addDueDate2Options);

            //Selects
            M.FormSelect.init(document.querySelectorAll('select'), {});
        },
        methods: {
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
            }
        }
    });
});

function appendTime(dateFromPicker) {
    return new Date(dateFromPicker.concat(' 00:00:00'));
}