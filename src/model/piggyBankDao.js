const Dao = require('./dao');
const PiggyBank = require('./piggyBank');
const TagDao = require('./tagDao');

module.exports = class PiggyBankDao extends Dao {
    constructor(pPool) {
        super(pPool);
        this.Dao = new Dao();
        this.tagDao = new TagDao(pPool);
    }

    createOrUpdate(piggyBank) {
        const pool = this.pool;
        const tagDao = this.tagDao;
        return new Promise(function (resolve, reject) {
            const params = [
                piggyBank.id || null,
                piggyBank.userId,
                piggyBank.accountId,
                piggyBank.name,
                piggyBank.balance,
                piggyBank.goal
            ];
            const promises = [
                pool.query(Dao.composeQuery('createOrUpdatePiggyBank', params), params)
            ];
            if (piggyBank.tags.length)
                promises.push(tagDao.createOrUpdateBatch(piggyBank.tags));

            Promise.all(promises).then(values => {
                const ids = new Array();
                if (values[1] && values[1].length) {
                    for (let i = 0; i < values[1].length; i++)
                        ids.push([values[0][0][0].id, values[1][i].id]);
                } else {
                    ids.push([values[0][0][0].id])
                }
                tagDao.tagPiggyBank(ids).catch(err => {
                    Dao.handleQueryCatch(err);
                });

                const temp = new PiggyBank(
                    values[0][0][0].id,
                    values[0][0][0].userId,
                    values[0][0][0].accountId,
                    values[0][0][0].name,
                    values[0][0][0].balance,
                    values[0][0][0].goal,
                    values[1]
                );
                resolve(temp);
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(null);
            });
        });
    }

    delete(pId) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.query('CALL deletePiggyBank(?)', pId).then(rows => {
                resolve(true);
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(false);
            });
        });
    }

    deleteBatch(ids) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.batch('CALL deletePiggyBank(?)', ids).then(rows => {
                resolve(true);
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(false);
            });
        });
    }
}