module.exports = class Bill {
    constructor(pId, pUserId, pPeriodId, pAccountId, pName, pAmount, pWeekDay, pNumOfPeriods, pPaidThisPeriod, pDueDate, pNotifications) {
        this.id = pId;
        this.userId = pUserId,
        this.periodId = pPeriodId,
        this.accountId = pAccountId,
        this.name = pName,
        this.amount = pAmount,
        this.weekDay = pWeekDay,
        this.numOfPeriods = pNumOfPeriods,
        this.paid = pPaidThisPeriod,
        this.dueDate = pDueDate,
        this.notifications = pNotifications
    }
}