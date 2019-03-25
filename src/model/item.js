const Account = require('./account.js');
const AccountDao = require('./accountDao');

module.exports = class Item {
    constructor(pId, pAccessToken, pInstitutionName, pLastSync, pAccounts) {
        this.id = pId;
        this.accessToken = pAccessToken;
        this.institutionName = pInstitutionName;
        this.lastSync = pLastSync;
        this.accounts = pAccounts;
        this.transactions = new Array();
    }
}