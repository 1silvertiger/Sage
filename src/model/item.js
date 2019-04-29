module.exports = class Item {
    constructor(pId, pUserId, pAccessToken, pInstitutionName, pLastSync, pAccounts, pTransactions) {
        this.id = pId;
        this.userId = pUserId;
        this.accessToken = pAccessToken;
        this.institutionName = pInstitutionName;
        this.lastSync = pLastSync;
        this.accounts = pAccounts || new Array();
        this.transactions = pTransactions || new Array();
    }
}