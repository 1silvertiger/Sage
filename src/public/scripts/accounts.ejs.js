$(document).ready(function () {
    Vue.component('account-notifications-modal', {
        props: ['account'],
        data: function () {
            return {
                notificationToCreate: { accountId: this.account.id }
            }
        },
        methods: {
            add: function () {
                this.account.notifications.push(this.notificationToCreate);
                this.notificationToCreate = { accountId: this.account.id }
            },
            remove: function (index) {
                this.account.notifications.splice(index, 1);
            },
            formatCurrency: function (amount) {
                return numeral(amount).format('$0,0.00');
            },
            saveNotifications: function() {
                const account = this.account;
                $.ajax({
                    url: URL + '/saveAccountNotifications',
                    type: 'POST',
                    data: JSON.stringify({ account: account }),
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function (data) {
                        refreshUser();
                    },
                    error: function (jqxhr, status, error) {
                        let i = 0;
                    }
                });
            }
        }
    });
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
            },
            formatCurrency: function (amount) {
                return numeral(amount).format('$0,0.00');
            },
        }
    });
});