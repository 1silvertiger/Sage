const Account = require('./account.js');
const AccountDao = require('./accountDao');

module.exports = class Item {
    constructor(pId, pAccessToken, pInstitutionName, pLastSync, pAccounts, pTransactions) {
        this.id = pId;
        this.accessToken = pAccessToken;
        this.institutionName = pInstitutionName;
        this.lastSync = pLastSync;
        this.accounts = pAccounts || new Array();
        this.transactions = pTransactions || new Array();
    }
}