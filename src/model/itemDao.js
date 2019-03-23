const Dao = require('./dao');
const Item = require('./item');
const Account = require('./accounts');
const AccountDao = require('./accountDao');

module.exports = class ItemDao {
    constructor(pPool) {
        super(pPool);
        this.AccountDao = new AccountDao(this.pool);
    }

    create() {

    }

    getAllByUserId(userId) {
        return new Promise(function (resolve, reject) {
            this.conn.query('CALL getAllPlaidItemsByUserId(?)', [userId]).then(itemRows => {
                let items = new Array();
                for (let i = 0; i < itemRows.length; i++) {
                    items.push(new Item(rows[i].itemId, rows[i].accessToken, rows[i].lastSync, new Array()));
                }
            }).catch(err => { });
        });
    }

    getById(id) {
        const AccountDao = this.AccountDao;
        return new Promise(function(resolve, reject) {
            this.pool.getConnection().then(conn => {
                conn.query('CALL getPlaidItemById(?', [id]).then(rows => {
                    const accounts = new Array();
                    for (let i = 0; i < rows[0][0].accountIds.length; i++) {
                        AccountDao.getByIds(rows[0][0].accountIds[i]).then().catch();
                    }
                    resolve(new Item(id, rows[0][0].accessToken, 'temp', rows[0][0].lastSync, accounts));
                }).catch(err => {
                    Dao.handleQueryCatch(err);
                });
            }).catch(err => {
                Dao.handleGetConnectionCatch(err);
            });
        });
    }

    update(item) {

    }

    deleteByItemId(id) {

    }
}