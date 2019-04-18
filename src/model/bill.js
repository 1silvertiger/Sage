// const moment = require('moment');

module.exports = class Bill {
    constructor(pId, pUserId, pPeriodId, pAccountId, pName, pAmount, pAutoPay, pWeekDay, pNumOfPeriods, pPaidThisPeriod, pDueDate, pNotifications, pTags) {
        this.id = pId;
        this.userId = pUserId,
        this.periodId = pPeriodId,
        this.accountId = pAccountId,
        this.name = pName,
        this.amount = pAmount,
        this.autoPay = pAutoPay,
        this.weekDay = pWeekDay,
        this.numOfPeriods = pNumOfPeriods,
        this.paid = pPaidThisPeriod,
        this.dueDate = pDueDate,
        this.notifications = pNotifications,
        this.tags = pTags
    }

    // getFormattedDueDate() {
    //     return moment(this.dueDate).format('MMM DD, YYYY');
    // }

    // getFormattedDueDate2() {
    //     return moment(this.dueDate2).format('MMM DD, YYYY');
    // }
}