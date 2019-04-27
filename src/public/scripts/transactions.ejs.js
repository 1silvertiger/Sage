$(document).ready(function () {

    Vue.component('transaction-items-modal', {
        props: ['transaction'],
        data: function () {
            return {

            }
        },
        mounted: function () {
            //Modals
            M.Modal.init(document.querySelector('.modal'), {
                preventScrolling: true,
                dismissable: true,
            });

            //Datepicker
            M.Datepicker.init(document.querySelector('#datepicker-' + this.transaction.id), {
                autoClose: true,
                defaultDate: new Date(this.transaction.date)
            });
        },
        methods: {
            getFormattedDate: function (date) {
                return moment(date).format('MMM DD, YYYY');
            },
            getFormattedCurrency: function (amount) {
                return numeral(amount).format('$0,0.00');
            }
        },
        computed: {
            transactionItems: function () {
                return this.transaction.transactionItems.filter(transactionItem => !transactionItem.default);
            }
        }
    });

    const app = new Vue({
        el: '#app',
        data: {
            user: user,
            transactionItemsToCreate: new Array()
        },
        mounted: function () {
            
        },
        methods: {
            getFormattedDate: function (date) {
                return moment(date).format('MMM DD, YYYY');
            },
            getFormattedCurrency: function (amount) {
                return numeral(amount).format('$0,0.00');
            }
        },
        computed: {
            transactions: function () {
                let transactions = new Array();
                for (let i = 0; i < user.items.length; i++)
                    transactions = transactions.concat(user.items[i].transactions)
                return transactions.sort((a, b) => {
                    const first = moment(a.date);
                    const second = moment(b.date);
                    if (first.isBefore(second))
                        return 1;
                    else if (second.isBefore(first))
                        return -1;
                    else
                        return 0;
                });
            }
        }
    });
});