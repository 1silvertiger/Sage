const Dao = require('./dao');
const Budget = require('./budget');

module.exports = class SpendingDao extends Dao {
    constructor(pPool) {
        super(pPool);
        this.Dao = new Dao();
    }

    getRecentTotalsByBudgetId(pDate, pUserId) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.query('CALL getRecentTotalsByBudgetItemId(?,?)', [pDate, pUserId]).then(rows => {
                const budgets = new Array();
                for (let i = 0; i < rows.length - 1; i++) {
                    const budgetItems = new Array();
                    for (let j = 0; j < rows[i].length; j++) {
                        budgetItems.push({
                            budgetItemId: rows[i][j].id,
                            periodId: rows[i][j].periodId,
                            name: rows[i][j].name,
                            amount: rows[i][j].amount,
                            total: rows[i][j].total
                        });
                    }
                    budgets.push(budgetItems);
                }
                resolve(budgets);
            }).catch(err => {
                resolve(null);
                Dao.handleQueryCatch(err);
            });
        });
    }

    getTotalByBudgetIdBatch(params) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.batch('CALL getTotalSpendingByBudgetId(?,?)', params).then(rows => {
                const data = new Array();
                for (let i = 0; i < rows.length; i += 2) {
                    data.push(rows[i][0].total || 0);
                }
                resolve(data);
            }).catch(err => {
                resolve(null);
                Dao.handleQueryCatch(err);
            });
        });
    }

    getTotalUnbudgetedBatch(params) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.batch('CALL getUnbudgetedSpending(?,?)', params).then(rows => {
                const data = new Array();
                for (let i = 0; i < rows.length; i += 2)
                    data.push(rows[i][0].total || 0);
                resolve(data);
            }).catch(err => {
                resolve(null);
                Dao.handleQueryCatch(err);
            });
        });
    }

    getTotalByTagIdBatch(params) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.batch('CALL getTotalSpendingByTagId(?,?,?)', params).then(rows => {
                const data = new Array();
                for (let i = 0; i < rows.length; i += 2)
                    data.push(rows[i][0].total);
                resolve(data);
            }).catch(err => {
                resolve(null);
                Dao.handleQueryCatch(err);
            });
        });
    }
}