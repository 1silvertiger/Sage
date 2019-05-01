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
            if (tags.length) {
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
            } else {
                resolve(new Array());
            }
        });
    }

    tagBudgetItemsBatch(ids) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.query('CALL untagBudgetItem(?)', [ids[0][0]]).then(rows => {
                pool.batch('CALL tagBudgetItem(?,?)', ids).then(rows => {
                    resolve(true);
                }).catch(err => {
                    Dao.handleQueryCatch(err);
                });
            }).catch(err => {
                resolve(false);
                Dao.handleQueryCatch(err);
            });
        });
    }

    tagTransactionItemsBatch(ids) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            const transactionItemIds = new Array();
            for (let i = 0; i < ids.length; i++)
                transactionItemIds.push(ids[i][0]);
            pool.batch('CALL untagTransactionItem(?)', transactionItemIds).then(rows => {
                pool.batch('CALL tagTransactionItem(?,?)', ids).then(rows => {
                    resolve(true);
                }).catch(err => {
                    resolve(false);
                    Dao.handleQueryCatch(err);
                });
            }).catch(err => {
                resolve(false);
                Dao.handleQueryCatch(err);
            });
        });
    }

    tagPiggyBank(ids) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.query('CALL untagPiggyBank(?)', [ids[0][0]]).then(rows => {
                pool.batch('CALL tagPiggyBank(?,?)', ids).then(rows => {
                    resolve(true);
                }).catch(err => {
                    Dao.handleQueryCatch(err);
                });
            }).catch(err => {
                resolve(false);
                Dao.handleQueryCatch(err);
            });
        });
    }

    tagTransactionItem(ids) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.query('CALL untagTransactionItem(?)', [ids[0][0]]).then(rows => {
                pool.batch('CALL tagTransactionItem(?,?)', ids).then(rows => {
                    resolve(true);
                }).catch(err => {
                    Dao.handleQueryCatch(err);
                });
            }).catch(err => {
                resolve(false);
                Dao.handleQueryCatch(err);
            });
        });
    }
}