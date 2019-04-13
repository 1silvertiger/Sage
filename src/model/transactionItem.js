module.exports = class TransactionItem {
    constructor(pId, pTransactionId, pAmount, pNote, pTags) {
        this.id = pId;
        this.transactionId = pTransactionId;
        this.amount = pAmount;
        this.note = pNote;
        this.tags = pTags || new Array();
    }
}