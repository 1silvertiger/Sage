const Dao = require('./dao');
const Item = require('./item');

module.exports = class ItemDao extends Dao {
    constructor(pPool) {
        super(pPool);
        this.Dao = new Dao(pPool);
    }

    delete(id) {
        const pool = this.pool;
        return new Promise(function(resolve, reject) {
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
}