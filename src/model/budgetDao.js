const Dao = require('./dao');
const Budget = require('./budget');
const Tag = require('./tag');
const TagDao = require('./tagDao');

module.exports = class BudgetDao extends Dao {
    constructor(pPool) {
        super(pPool);
        this.Dao = new Dao();
        this.tagDao = new TagDao(pPool);
    }

    createOrUpdate(budget) {
        const pool = this.pool;
        const tagDao = this.tagDao;
        return new Promise(function (resolve, reject) {
            const params = [
                budget.id || null,
                budget.userId,
                budget.periodId,
                budget.tag ? budget.tag.id : null,
                budget.name,
                budget.amount,
                budget.numOfPeriods
            ];
            const promises = [
                pool.query(Dao.composeQuery('createOrUpdateBudgetItem', params), params)
            ];
            if (budget.tags.length) {
                promises.push(tagDao.createOrUpdateBatch(budget.tags));
            }

            Promise.all(promises).then(values => {
                if (values[1].length) {
                    const ids = new Array();
                    for (let i = 0; i < values[1].length; i++)
                        ids.push([values[0][0][0].id, values[1][i].id]);
                    tagDao.tagBudgetItemsBatch(ids).catch(err => {
                        Dao.handleQueryCatch(err);
                    });
                }
                resolve(new Budget(
                    values[0][0][0].id,
                    values[0][0][0].userId,
                    values[0][0][0].periodId,
                    new Tag(values[0][1][0].id, values[0][1][0].userId, values[0][1][0].name),
                    values[0][0][0].name,
                    values[0][0][0].amount,
                    values[0][0][0].numOfPeriods,
                    values[1] || new Array()
                ));
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(null);
            });
        });
    }

    deleteBatch(budgetItemIds) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.batch('CALL deleteBudgetItem(?)', budgetItemIds).then(rows => {
                resolve(true);
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(null);
            });
        });
    }
}