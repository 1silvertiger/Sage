const moment = require('moment');

module.exports = class Bill {
    constructor(pId, pUserId, pPeriodId, pAccountId, pTag, pName, pAmount, pAutoPay, pWeekDay, pdueDate, pdueDate2, pPaid) {
        this.id = pId;
        this.userId = pUserId,
        this.periodId = pPeriodId,
        this.accountId = pAccountId,
        this.tag = pTag,
        this.name = pName,
        this.amount = pAmount,
        this.autoPay = pAutoPay,
        this.weekDay = pWeekDay,
        this.dueDate = pdueDate,
        this.dueDate2 = pdueDate2,
        this.paid = pPaid
    }

    getFormattedDueDate() {
        return moment(this.dueDate).format('MMM DD, YYYY');
    }

    getFormattedDueDate2() {
        return moment(this.dueDate2).format('MMM DD, YYYY');
    }
}