const Dao = require('./dao');
const Account = require('./account.js');

module.exports = class AccountDao extends Dao {
    constructor(pPool) {
        super(pPool);
        this.Dao = new Dao();
    }

    create(account) {
        const pool = this.pool;
        return new Promise(function(resolve, reject){
            pool.getConnection().then(conn => {
                const params = [
                    account.id
                    , account.institutionName
                    , account.plaidItemId
                    , account.availableBalance
                    , account.currentBalance
                    , account.name
                    , account.officialName
                    , account.type
                    , account.subType
                ];
                conn.query(Dao.composeQuery('createAccount', params), params).then(rows => {
                    resolve(new Account(rows[0][0].id, rows[0][0].plaidItemId, rows[0][0].institutionName, rows[0][0].availableBalance, rows[0][0].currentBalance, rows[0][0].name, rows[0][0].officialName, rows[0][0].type, rows[0][0].subType));
                }).catch(err => {
                    Dao.handleQueryCatch(err);
                });
            }).catch(err => {
                Dao.handleGetConnectionCatch(err);
            });
        });
    }

    getAllByItemId(itemId) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.getConnection().then(conn => {
                conn.query('CALL getAllAccountsByItemId(?)', [itemId]).then(rows => {
                    const accounts = new Array();
                    for (let i = 0; i < rows.length; i++) {
                        accounts.push(new Account(rows.id, rows.plaidItemId, rows.institutionName, rows.availableBalance, rows.currentBalance, rows.name, rows.officialName, rows.type, rows.subType));
                    }
                    resolve(accounts);
                }).catch(err => {
                    Dao.handleQueryCatch();
                });
            }).catch(err => {
                Dao.handleGetConnectionCatch();
            });
        });
    }

    getById(id) {

    }
}