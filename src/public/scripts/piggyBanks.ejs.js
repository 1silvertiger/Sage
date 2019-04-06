$(document).ready(function () {
    const newPiggyBankTags = new Array();

    const app = new Vue({
        el: '#app',
        data: {
            user: user,
            piggyBanksToDelete: new Array(),
            piggyBankToCreate: { userId: user.id, tags: new Array(), balance: 0 }
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

            const tags = {};
            for (let i = 0; i < user.tags.length; i++) {
                tags[user.tags[i].name] = user.tags[i].id
            }
            //Chips
            M.Chips.init(document.querySelectorAll('.chips'), {
                autocompleteOptions: tags,
                onChipAdd: function () {
                    const temp = M.Chips.getInstance(document.querySelector('#addTags')).chipsData;
                    const temp2 = {
                        userId: user.id,
                        name: M.Chips.getInstance(document.querySelector('#addTags')).chipsData[$vm.piggyBankToCreate.tags.length].tag
                    };
                    const temp3 = $vm.piggyBankToCreate;
                    newPiggyBankTags.push(temp2);
                    $vm.piggyBankToCreate.tags.push(temp2);
                }
            });

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
                $.ajax({
                    url: URL + '/createOrUpdatePiggyBank'
                    , type: 'POST'
                    , data: JSON.stringify({ piggyBank: piggyBank })
                    , dataType: 'json'
                    , contentType: 'application/json'
                    , success: function (newPiggyBank) {
                        refreshUser().catch(err => {
                            user.piggyBanks.push(JSON.parse(newPiggyBank));
                        });
                    },
                    error: function(jqxhr, status, error) {
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
            }
        }
    });
});