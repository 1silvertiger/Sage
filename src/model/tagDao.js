const Dao = require('./dao');
const Tag = require('./tag');

module.exports = class TagDao extends Dao {
    constructor(pPool) {
        super(pPool);
        this.Dao = new Dao();
    }

    createOrUpdateBatch(tags) {
        const pool = this.pool;
        const params = new Array();
        for (let i = 0; i < tags.length; i++) {
            params.push([
                tags[i].id || null,
                tags[i].name,
                tags[i].userId
            ]);
        }

        return new Promise(function (resolve, reject) {
            pool.batch('CALL createOrUpdateTag(?,?,?)', params).then(rows => {
                const tags = new Array();
                for (let i = 0; i < rows.length; i += 2) {
                    tags.push(new Tag(
                        rows[i][0].id,
                        rows[i][0].userId,
                        rows[i][0].name
                    ));
                }
                resolve(tags);
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(null);
            });
        });
    }

    tagBudgetItemsBatch(ids) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            const promises = [
                pool.query('CALL untagBudgetItem(?)', [ids[0][0]]),
                pool.batch('CALL tagBudgetItem(?,?)', ids)
            ]
            Promise.all(promises).then(rows => {
                resolve(true);
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(false);
            });
        });
    }

    tagBill(ids) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            const promises = [
                pool.query('CALL untagBill(?)', ids[0][0]),
                pool.batch('CALL tagBill(?,?)', ids)
            ];
            Promise.all(promises).then(rows => {
                resolve(true);
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(false);
            });
        });
    }

    tagPiggyBank(ids) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            const promises = [
                pool.query('CALL untagPiggyBank(?)', ids[0][0]),
                pool.batch('CALL tagPiggyBank(?,?)', ids)
            ];
            Promise.all(promises).then(rows => {
                resolve(true);
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(false);
            });
        });
    }

    tagTransactionItem(ids) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            const promises = [
                pool.query('untagTransactionItem(?)', ids[0][0]),
                pool.batch('tagTransactionItem(?,?)', ids)
            ];
            Promise.all(promises).then(rows => {
                resolve(true);
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(false);
            });
        });
    }
}