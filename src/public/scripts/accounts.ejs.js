const ALL = '0',
    DEBIT = '1',
    CREDIT = '2',
    INVESTMENT = '3';

$(document).ready(function () {
    const table = new Vue({
        el: '#table',
        data: {
            rawAccounts: accounts,
            typesToShow: new Array('0'),
        },
        mounted: function () {
            M.AutoInit();
            showSelector = M.FormSelect.getInstance(document.querySelector("#showSelector"));
            typesToShow = showSelector.getSelectedValues();
        },
        computed: {
            filteredAccounts: function (rawAccounts) {
                let typesToShow = this.typesToShow;
                return this.rawAccounts.filter(function (account) {
                    if (typesToShow) {
                        if (typesToShow.includes(ALL)
                            || (typesToShow.includes(DEBIT)
                                && typesToShow.includes(CREDIT)
                                && typesToShow.includes(INVESTMENT)))
                            return true;
                        else if (typesToShow.includes(DEBIT)
                            && !typesToShow.includes(CREDIT)
                            && !typesToShow.includes(INVESTMENT)) {
                            return isDebit(account);
                        }
                        else if (typesToShow.includes(DEBIT)
                            && typesToShow.includes(CREDIT)
                            && !typesToShow.includes(INVESTMENT)) {
                            return isDebit(account) || isCredit(account);
                        }
                        else if (typesToShow.includes(DEBIT)
                            && !typesToShow.includes(CREDIT)
                            && typesToShow.includes(INVESTMENT)) {
                            return isDebit(account) || isInvestment(account);
                        }
                        else if (!typesToShow.includes(DEBIT)
                            && typesToShow.includes(CREDIT)
                            && !typesToShow.includes(INVESTMENT)) {
                            return isCredit(account);
                        } else if (!typesToShow.includes(DEBIT)
                            && typesToShow.includes(CREDIT)
                            && typesToShow.includes(INVESTMENT)) {
                            return isCredit(account) || isInvestment(account);
                        } else if (!typesToShow.includes(DEBIT)
                            && !typesToShow.includes(CREDIT)
                            && typesToShow.includes(INVESTMENT)) {
                            return isInvestment(account);
                        }
                    } else
                        return true;
                });
            }
        }
    });
});

function showDebit(selectedTypes) {
    return selectedTypes.includes(DEBIT);
}

function showCredit(selectedTypes) {
    return selectedTypes.includes(CREDIT);
}

function showInvestments(selectedTypes) {
    return selectedTypes.includes(INVESTMENT);
}


function isDebit(account) {
    return account.subtype === 'checking' || account.subtype === 'savings';
}

function isCredit(account) {
    return account.subtype === 'credit card';
}

function isInvestment(account) {
    return account.subtype === 'cd'
        || account.subtype === 'money market'
        || account.subtype === 'ira'
        || account.subtype === '401k';
}