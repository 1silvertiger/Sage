const Dao = require('./dao');
const Budget = require('./budget');

module.exports = class BudgetDao extends Dao {
    constructor(pPool) {
        super(pPool);
        this.Dao = new Dao();
    }

    createOrUpdate(budget) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            const params = [
                budget.id
                , budget.userId
                , budget.periodId
                , budget.name
                , budget.amount
                , budget.numOfPeriods
            ];
            pool.query(Dao.composeQuery('createOrUpdateBudgetItem', params), params).then(rows => {
                resolve(new Budget(rows[0][0].id, rows[0][0].userId, rows[0][0].periodId, rows[0][0].name, rows[0][0].name, rows[0][0].amount, rows[0][0].numOfPeriod));
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(null);
            });
        });
    }

    deleteBatch(budgetItemIds) {
        const pool = this.pool;
        return new Promise(function(resolve, reject) {
            pool.batch('CALL deleteBudgetItem(?)', budgetItemIds).then(rows => {
                resolve(true);
            }).catch(err => {
                console.log(err);
                Dao.handleQueryCatch(err);
                resolve(null);
            });
        });
    }
}