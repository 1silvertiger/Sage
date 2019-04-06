$(document).ready(function () {
    const app = new Vue({
        el: '#app',
        data: {
            user: user,
            billsToDelete: new Array(),
            billToCreate: { userId: user.id }
        },
        mounted: {

        },
        methods: {
            createOrUpdateBills: function (bill) {

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