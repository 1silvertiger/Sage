module.exports = class {
    constructor(pId, pBillId, pPeriodId, pPeriodsBeforeBillIsDue) {
        this.id = pId,
        this.billId = pBillId,
        this.periodId = pPeriodId,
        this.periodsBeforeBillIsDue = pPeriodsBeforeBillIsDue
    }
}