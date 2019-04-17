module.exports = class Budget {
    constructor(pId, pUserId, pPeriodId, pTag, pName, pAmount, pNumOfPeriods, pTags) {
        this.id = pId, 
        this.userId = pUserId, 
        this.periodId = pPeriodId, 
        this.tag = pTag,
        this.name = pName, 
        this.amount = pAmount, 
        this.numOfPeriods = pNumOfPeriods, 
        this.tags = pTags || new Array()
    }
}