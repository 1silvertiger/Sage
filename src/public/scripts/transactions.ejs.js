$(document).ready(function () {

    Vue.component('transaction-items-modal', {
        props: ['transaction'],
        data: function () {
            return {
                transactionItems: this.transaction.transactionItems,
                transactionItemToCreate: {
                    transactionId: this.transaction.id,
                    tags: new Array(),
                    appliedDate: this.transaction.date,
                    default: false
                }
            }
        },
        mounted: function () {
            const $vm = this;

            //Modals
            M.Modal.init(document.querySelector('.modal'), {
                preventScrolling: true,
                dismissable: true,
            });

            //Datepicker
            for (let i = 0; i < this.transactionItems.length; i++)
                M.Datepicker.init(document.querySelector('#appliedDate-' + i + '-' + this.transaction.id), {
                    autoClose: true,
                    setDefaultDate: true,
                    defaultDate: new Date(this.transactionItems[i].appliedDate),
                    container: document.querySelector('#app'),
                    onClose: function () {
                        $vm.transactionItems[i].appliedDate = new Date(this.toString());
                    }
                });
            M.Datepicker.init(document.querySelector('#addAppliedDate-' + this.transaction.id), {
                autoClose: true,
                setDefaultDate: true,
                defaultDate: new Date(this.transaction.date),
                container: document.querySelector('#app'),
                onClose: function () {
                    $vm.transactionItemToCreate.appliedDate = new Date(this.toString());
                }
            });

            //Chips
            for (let i = 0; i < this.transactionItems.length; i++) {
                const chips = new Object();
                for (let j = 0; j < this.transactionItems[i].tags.length; j++)
                    chips[this.transactionItems[i].tags[j].name] = null;
                M.Chips.init(document.querySelector('#tags-' + i + '-' + this.transaction.id), {
                    placeholder: 'Add tags',
                    secondaryPlaceholder: 'Add more tags',
                    data: chips,
                    onChipAdd: function() {
                        // alert(JSON.stringify(this.chipsData[this.chipsData.length - 1]));
                        $vm.transactionItems[i].tags.push({
                            id: getTagId(this.chipsData[this.chipsData.length - 1].tag),
                            name: this.chipsData[this.chipsData.length - 1].tag,
                            userId: user.id
                        });
                    }
                });
            }
            M.Chips.init(document.querySelector('#addTags-' + this.transaction.id), {
                placeholder: 'Add tags',
                secondaryPlaceholder: 'Add more tags',
                onChipAdd: function() {
                    alert(this.chipsData[this.chipsData.length - 1]);
                }
            });
        },
        methods: {
            addTransactionItem: function () {
                const $vm = this;
                const chips = M.Chips.getInstance(document.querySelector('#addTags-' + this.transaction.id));
                for (let i = 0; i < chips.chipsData.length; i++)
                    this.transactionItemToCreate.tags.push({
                        id: getTagId(chips.chipsData[i].tag),
                        name: chips.chipsData[i].tag,
                        userId: user.id
                    });
                this.transactionItems.push(Object.assign({}, this.transactionItemToCreate));
                this.$nextTick(function () {
                    const index = this.transactionItems.length - 1;
                    const selector = index + '-' + this.transaction.id;
                    M.Datepicker.init(document.querySelector('#appliedDate-'.concat(selector)), {
                        autoClose: true,
                        setDefaultDate: true,
                        defaultDate: new Date(this.transactionItems[index].appliedDate),
                        container: document.querySelector('#app'),
                        onClose: function () {
                            $vm.transactionItems[index].appliedDate = this.toString();
                        }
                    });
                    M.Chips.init(document.querySelector('#tags-'.concat(selector)), {
                        placeholder: 'Add tags',
                        secondaryPlaceholder: 'Add more tags',
                        data: chips.chipsData
                    });
                    this.transactionItems[0].amount = this.remainder;

                    //Clear info
                    M.updateTextFields();
                    for (let i = 0; i < chips.chipsData.length; i++)
                        chips.deleteChip(i);
                });
                this.transactionItemToCreate = {
                    tags: new Array(),
                    appliedDate: this.transaction.date
                };
            },
            save: function () {
                const $vm = this;
                $.ajax({
                    url: URL + '/saveTransactionItems',
                    type: 'POST',
                    data: JSON.stringify({ 
                        transactionId: $vm.transaction.id, 
                        transactionItems: $vm.transactionItems 
                    }),
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function() {
                        $vm.transaction.transactionItems = $vm.transactionItems;
                    },
                    error: function() {

                    }
                });
            },
            getFormattedDate: function (date) {
                return moment(date).format('MMM DD, YYYY');
            },
            getFormattedCurrency: function (amount) {
                return numeral(amount).format('$0,0.00');
            }
        },
        computed: {
            remainder: function () {
                let remainder = this.transaction.amount;
                for (let i = 0; i < this.transactionItems.length; i++)
                    if (!this.transactionItems[i].default)
                        remainder -= this.transactionItems[i].amount;
                return remainder;
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