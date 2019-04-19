module.exports = class Budget {
    constructor(pId, pUserId, pPeriodId, pName, pAmount, pNumOfPeriods, pTags) {
        this.id = pId, 
        this.userId = pUserId, 
        this.periodId = pPeriodId, 
        this.name = pName, 
        this.amount = pAmount, 
        this.numOfPeriods = pNumOfPeriods, 
        this.tags = pTags || new Array()
    }
}