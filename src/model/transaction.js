module.exports = class Transaction {
    //Full
    constructor(pId, pPlaidItemId, pAccountId, pAmount, pMerchant, pDate, pTransactionItems) {
        this.id = pId;
        this.plaidItemId = pPlaidItemId;
        this.accountId = pAccountId;
        this.amount = pAmount;
        this.merchant = pMerchant;
        this.date = moment(pDate);
        this.transactionItems = pTransactionItems || new Array();
    }
}