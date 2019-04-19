module.exports = class PiggyBank {
    constructor(pId, pUserId, pAccountId, pName, pBalance, pGoal, pTags){
        this.id = pId;
        this.userId = pUserId;
        this.accountId = pAccountId;
        this.name = pName;
        this.balance = pBalance;
        this.goal = pGoal;
        this.tags = pTags || new Array();
    }
}