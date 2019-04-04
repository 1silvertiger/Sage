module.exports = class PiggyBank {
    constructor(pId, pUserId, pAccountId, pTagId, pName, pBalance, pGoal, pTags){
        this.id = pId;
        this.userId = pUserId;
        this.accountId = pAccountId;
        this.tagId = pTagId;
        this.name = pName;
        this.balance = pBalance;
        this.goal = pGoal;
        this.tags = pTags || new Array();
    }
}