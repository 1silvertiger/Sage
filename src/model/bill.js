const moment = require('moment');

module.exports = class Bill {
    constructor(pId, pUserId, pPeriodId, pAccountId, pTag, pName, pAmount, pAutoPay, pWeekDay, pDue, pPaidThisPeriod, pNotifications, pTags) {
        this.id = pId;
        this.userId = pUserId,
        this.periodId = pPeriodId,
        this.accountId = pAccountId,
        this.tag = pTag,
        this.name = pName,
        this.amount = pAmount,
        this.autoPay = pAutoPay,
        this.weekDay = pWeekDay,
        this.due = pDue,
        this.paid = pPaidThisPeriod,
        this.notifications = pNotifications,
        this.tags = pTags
    }

    getFormattedDueDate() {
        return moment(this.dueDate).format('MMM DD, YYYY');
    }

    getFormattedDueDate2() {
        return moment(this.dueDate2).format('MMM DD, YYYY');
    }
}