const Dao = require('./dao');
const Tag = require('./tag');

module.exports = class TagDao extends Dao {
    constructor(pPool) {
        super(pPool);
        this.Dao = new Dao();
    }

    createOrUpdate(pTag) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {

        });
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
            pool.batch('tagBudgetItem(?,?)', ids).then(rows => {
                resolve(true);
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(false);
            });
    tagBill(ids) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.batch('tagBill(?,?)', ids).then(rows => {
                resolve(true);
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(false);
            });
        }).catch(err => {
            Dao.handleQueryCatch(err);
            resolve(false);
        });
    }

    tagPiggyBank(ids) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.batch('tagPiggyBank(?,?)', ids).then(rows => {
                resolve(true);
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(false);
            });
        }).catch(err => {
            Dao.handleQueryCatch(err);
            resolve(false);
        });
    }

    tagTransactionItem(ids) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.batch('tagTransactionItem(?,?)', ids).then(rows => {
                resolve(true);
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(false);
            });
        }).catch(err => {
            Dao.handleQueryCatch(err);
            resolve(false);
        });
    }
}