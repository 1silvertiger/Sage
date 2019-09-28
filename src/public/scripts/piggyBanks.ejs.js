$(document).ready(function () {
    const newPiggyBankTags = new Array();

    const app = new Vue({
        el: '#app',
        data: {
            user: user,
            piggyBanksToDelete: new Array(),
            piggyBankToCreate: {
                userId: user.id,
                tags: new Array(),
                balance: 0,
                accountId: user.items[0].accounts[0].id
            }
        },
        mounted: function () {
            const $vm = this;

            refreshUser().catch(err => {
                console.log(err);
            });

            //Selects
            M.FormSelect.init(document.querySelectorAll('select'), {});

            //Collapsibles
            M.Collapsible.init(document.querySelectorAll('.collapsible'), {});

            //Chips
            //Autocomplete options
            const autocompleteOptions = { data: new Object() };
            for (let i = 0; i < user.tags.length; i++)
                autocompleteOptions.data[user.tags[i].name] = null;

            M.Chips.init(document.querySelector('#addTags'), {
                autocompleteOptions: autocompleteOptions,
                placeholder: 'Add tags',
                secondaryPlaceholder: 'Add more tags'
            });

            for (let i = 0; i < user.piggyBanks.length; i++) {
                const tempTags = new Array();
                for (let j = 0; j < user.piggyBanks[i].tags.length; j++)
                    tempTags.push({ tag: user.piggyBanks[i].tags[j].name });
                M.Chips.init(document.querySelector('#updateTags-' + user.piggyBanks[i].id), {
                    data: tempTags,
                    autocompleteOptions: autocompleteOptions,
                    placeholder: 'Add tags',
                    secondaryPlaceholder: 'Add more tags'
                });
            }

            //Modals
            M.Modal.init(document.querySelectorAll('.modal'), { preventScrolling: true });
        },
        methods: {
            getAccountById: function (pId) {
                for (let i = 0; i < user.items.length; i++)
                    for (let j = 0; j < user.items[i].accounts.length; j++)
                        if (user.items[i].accounts[j].id === pId)
                            return user.items[i].accounts[j];
                return {};
            },
            createOrUpdatePiggyBank: function (piggyBank) {
                const $vm = this;
                const tagNames = new Array();
                const chips = M.Chips.getInstance(
                    document.querySelector(piggyBank.id ? '#updateTags-'.concat(piggyBank.id) : '#addTags')
                );
                for (let i = 0; i < chips.chipsData.length; i++)
                    tagNames.push(chips.chipsData[i].tag);
                piggyBank.tags = getTagsFromNames(tagNames);
                $.ajax({
                    url: URL + '/createOrUpdatePiggyBank',
                    type: 'POST',
                    data: JSON.stringify({ piggyBank: piggyBank }),
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function (newPiggyBank) {
                        refreshUser().then(refreshedUser => {
                            $vm.piggyBankToCreate = {
                                userId: user.id,
                                tags: new Array(),
                                balance: 0,
                                accountId: user.items[0].accounts[0].id
                            };
                        }).catch(err => {
                            user.piggyBanks.push(JSON.parse(newPiggyBank));
                        }).finally(() => {
                            // Initialize new Materialize elements
                            const autocompleteOptions = { data: new Object() };
                            for (let i = 0; i < user.tags.length; i++)
                                autocompleteOptions.data[user.tags[i].name] = null;
                            const temp = JSON.parse(newPiggyBank);
                            const tempTags = new Array();
                            for (let j = 0; j < temp.tags.length; j++)
                                tempTags.push({ tag: temp.name });
                            M.Chips.init(document.querySelector('#updateTags-' + temp.id), {
                                data: tempTags,
                                autocompleteOptions: autocompleteOptions,
                                placeholder: 'Add tags',
                                secondaryPlaceholder: 'Add more tags'
                            });

                            M.FormSelect.init(document.querySelectorAll('select'), {});
                            M.Collapsible.init(document.querySelectorAll('.collapsible'), {});
                            M.Modal.init(document.querySelectorAll('.modal'), {
                                preventScrolling: true
                            });
                        });
                    },
                    error: function (jqxhr, status, error) {
                        let i = 0;
                    }
                });
            },
            deletePiggyBanks: function (piggyBankIds) {
                $.ajax({
                    url: URL + '/deletePiggyBanks',
                    type: 'POST',
                    data: JSON.stringify({ piggyBankIds: piggyBankIds }),
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function (refreshedUser) {
                        const temp = refreshedUser;
                        user.items = temp.items;
                        user.budgetItems = temp.budgetItems;
                        user.piggyBanks = temp.piggyBanks;
                    },
                    error: function (jqxhr, status, error) {
                        let i = 0;
                    }
                });
            },
            getFormattedCurrency: function (amount) {
                return numeral(amount).format('$0,0.00');
            }
        }
    });
});