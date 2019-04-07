module.exports = class Bill {
    constructor(pId, pUserId, pPeriodId, pAccountId, pTag, pName, pAmount, pAutoPay, pWeekDay, pStartDate, pStartDate2) {
        this.id = pId;
        this.userId = pUserId,
        this.periodId = pPeriodId,
        this.accountId = pAccountId,
        this.tag = pTag,
        this.name = pName,
        this.amount = pAmount,
        this.autoPay = pAutoPay,
        this.weekDay = pWeekDay,
        this.startDate = pStartDate,
        this.startDate2 = pStartDate2
    }
}