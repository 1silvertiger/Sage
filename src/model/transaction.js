module.exports = class Transaction {
    constructor(pId, pPlaidItemId, pAccountId, pAmount, pMerchant, pDate, pTransactionItems) {
        this.id = pId;
        this.plaidItemId = pPlaidItemId;
        this.accountId = pAccountId;
        this.amount = pAmount;
        this.merchant = pMerchant;
        this.date = pDate;
        this.transactionItems = pTransactionItems || new Array();
    }
}