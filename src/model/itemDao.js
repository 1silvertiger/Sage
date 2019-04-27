const Dao = require('./dao');
const Item = require('./item');

module.exports = class ItemDao extends Dao {
    constructor(pPool) {
        super(pPool);
        this.Dao = new Dao(pPool);
    }

    create(item) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            const params = [
                item.userId,
                item.id,
                item.accessToken,
                item.institutionName
            ];
            pool.query('CALL createPlaidItem(?,?,?,?)', params).then(rows => {
                const temp = new Item(
                    rows[0][0].itemId,
                    rows[0][0].userId,
                    rows[0][0].accessToken,
                    rows[0][0].institutionName,
                    rows[0][0].lastSync,
                    null,
                    null
                );
                resolve(temp);
            }).catch(err => {
                resolve(null);
                console.log(err);
            });
        });
    }

    getAccessTokenAndLastSyncById(id) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.query('CALL getAccessTokenAndLastSyncByItemId(?)', [id]).then(rows => {
                resolve([rows[0][0].accessToken, rows[0][0].lastSync]);
            }).catch(err => {
                console.log(err);
                resolve(null);
            });
        });
    }

    delete(id) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.query('CALL deletePlaidItem(?)', [id]).then(rows => {
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
            pool.batch('CALL deletePlaidItem(?)', [ids]).then(rows => {
                resolve(true);
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(false);
            });
        });
    }

    updateLastSync(item) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.query('CALL updateItemLastSync(?,?)', [item.id, new Date()]).then(rows => {
                let i = 0;
            }).catch(err => { Dao.handleQueryCatch(err) });
        });
    }

    updateLastSyncById(id) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.query('CALL updateItemLastSync(?,?)', [id, new Date()]).catch(err => { Dao.handleQueryCatch(err) });
        });
    }
}