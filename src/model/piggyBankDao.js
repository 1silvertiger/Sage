const Dao = require('./dao');
const PiggyBank = require('./piggyBank');
const Tag = require('./tag');

module.exports = class PiggyBankDao extends Dao {
    constructor(pPool) {
        super(pPool);
        this.Dao = new Dao();
    }

    createOrUpdate(piggyBank) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            const params = [
                piggyBank.id || null,
                piggyBank.userId,
                piggyBank.accountId,
                piggyBank.tagId || null,
                piggyBank.name,
                piggyBank.balance,
                piggyBank.goal
            ];
            pool.query(Dao.composeQuery('createOrUpdatePiggyBank', params), params).then(rows => {
                const temp = new PiggyBank(rows[0][0].id, rows[0][0].userId, rows[0][0].accountId, rows[0][0].tagId, rows[0][0].name, rows[0][0].balance, rows[0][0].goal, null);
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
            pool.batch('CALL deletePiggyBank(?)').then(rows => {
                resolve(true);
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(false);
            });
        });
    }
}