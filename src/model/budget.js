module.exports = class Budget {
    constructor(pId, pUserId, pPeriodId, pName, pAmount, pNumOfPeriods, pCategoryId, pSubCategoryId) {
        this.id = pId
            , this.userId = pUserId
            , this.periodId = pPeriodId
            , this.name = pName
            , this.amount = pAmount
            , this.numOfPeriods = pNumOfPeriods
            , this.categoryId = pCategoryId
            , this.subCategoryId = pSubCategoryId
    }

    static parseClientBudget(budget) {
        return new Budget(
            budget.id
            , budget.userId
            , budget.periodId
            , budget.name
            , budget.amount
            , budget.numOfPeriods
        );
    }

    toClientBudget() {
        return {
            id: this.id
            , userId: this.userId
            , periodId: this.periodId
            , name: this.name
            , amount: this.amount
            , numOfPeriods: this.numOfPeriods
        };
    }
}