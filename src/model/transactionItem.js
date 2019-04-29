module.exports = class TransactionItem {
    constructor(pId, pTransactionId, pAmount, pNote, pAppliedDate, pDefault, pTags) {
        this.id = pId;
        this.transactionId = pTransactionId;
        this.amount = pAmount;
        this.note = pNote;
        this.appliedDate = pAppliedDate;
        this.default = pDefault;
        this.tags = pTags || new Array();
    }
}