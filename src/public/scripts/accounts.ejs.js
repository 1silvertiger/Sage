const ALL = '0',
    DEBIT = '1',
    CREDIT = '2',
    INVESTMENT = '3';

$(document).ready(function () {
    const table = new Vue({
        el: '#app',
        data: {
            user: user,
            showLoader: false
        },
        mounted: function () {
            //Modals
            M.Modal.init(document.querySelectorAll('.modal'), {
                preventScrolling: true,
                dismissible: true
            });
        },
        methods: {
            deleteItem: function (id) {
                this.showLoader = true;
                $.ajax({
                    url: URL + '/deletePlaidItem',
                    type: 'POST',
                    data: JSON.stringify({ id: id }),
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function (refreshedUser) {
                        user.items = refreshedUser.items;
                        user.budgetItems = refreshedUser.budgetItems;
                        user.piggyBanks = refreshedUser.piggyBanks;
                        user.bills = refreshedUser.bills;
                        const modal = M.Modal.getInstance(document.querySelector('#confirmDelete-' + id));
                        modal.close();
                        this.showLoader = false;
                    },
                    error: function (jqxhr, status, error) {
                        let i = 0;
                        this.showLoader = false;
                    }
                });
            }
        }
    });
});