module.exports = class Transaction {
    //Full
    constructor(pId, pPlaidItemId, pAccountId, pAmount, pMerchant, pDate, pCategory, pSubCategory, pTags) {
        this.id = pId;
        this.plaidItemId = pPlaidItemId;
        this.accountId = pAccountId;
        this.amount = pAmount;
        this.merchant = pMerchant;
        this.date = pDate;
        this.transactionItems = new Array();
        this.category = pCategory;
        this.subCategory = pSubCategory;
        this.tags = pTags;
    }
}