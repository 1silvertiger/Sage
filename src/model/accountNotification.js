module.exports = class AccountNotification {
    constructor(pId, pAccountId, pThreshold, pSpendable) {
        this.id = pId;
        this.accountId = pAccountId;
        this.threshold = pThreshold;
        this.spendable = pSpendable;
    }
}