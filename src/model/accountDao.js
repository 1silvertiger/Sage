const Dao = require('./dao');
const Account = require('./account.js');

module.exports = class AccountDao extends Dao {
    constructor(pPool) {
        super(pPool);
        this.Dao = new Dao();
    }

    create(account) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
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
                    conn.end();
                }).catch(err => {
                    Dao.handleQueryCatch(err);
                });
            }).catch(err => {
                Dao.handleGetConnectionCatch(err);
            });
        });
    }

    createOrUpdate(account) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
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
                conn.query(Dao.composeQuery('createOrUpdateAccount', params), params).then(rows => {
                    resolve(new Account(rows[0][0].id, rows[0][0].plaidItemId, rows[0][0].institutionName, rows[0][0].availableBalance, rows[0][0].currentBalance, rows[0][0].name, rows[0][0].officialName, rows[0][0].type, rows[0][0].subType));
                }).catch(err => {
                    Dao.handleQueryCatch(err);
                }).finally(() => {if(conn) conn.end()});
            }).catch(err => {
                Dao.handleGetConnectionCatch(err);
            });
        });
    }

    batchCreateOrUpdate(accounts) {
        const pool = this.pool;
        const params = new Array();
        for (let i = 0; i < accounts.length; i++) {
            params.push([
                accounts[i].id
                , accounts[i].institutionName
                , accounts[i].plaidItemId
                , accounts[i].availableBalance
                , accounts[i].currentBalance
                , accounts[i].name
                , accounts[i].officialName
                , accounts[i].type
                , accounts[i].subType
            ]);
        }
        return new Promise(function(resolve, reject){
            pool.batch(Dao.composeQuery2('createOrUpdateAccount', params[0].length), params).then(rows => {
                const accountsFromDb = new Array();
                for (let i = 0; i < params.length * 2; i += 2) {
                    accountsFromDb.push(new Account(
                        rows[i][0].id
                        , rows[i][0].plaidItemId
                        , rows[i][0].institutionName
                        , rows[i][0].availableBalance
                        , rows[i][0].currentBalance
                        , rows[i][0].name
                        , rows[i][0].officialName
                        , rows[i][0].type
                        , rows[i][0].subType
                    ));
                }
                resolve(accountsFromDb);
            }).catch(err => {
                Dao.handleQueryCatch(err);
            });
        });
    }

    getAllByItemId(itemId) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.getConnection().then(conn => {
                conn.query('CALL getAllAccountsByItemId(?)', [itemId]).then(rows => {
                    const accounts = new Array();
                    for (let i = 0; i < rows[0].length; i++) {
                        accounts.push(new Account(rows[0][i].id, rows[0][i].plaidItemId, rows[0][i].institutionName, rows[0][i].availableBalance, rows[0][i].currentBalance, rows[0][i].name, rows[0][i].officialName, rows[0][i].type, rows[0][i].subType));
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

    // update(account) {
    //     const pool = this.pool;
    //     return new Promise(function (resolve, reject) {
    //         pool.getConnection().then(conn => {
    //             const params = [account.id
    //                 , account.plaidItemId
    //                 , account.institutionName
    //                 , account.availableBalance
    //                 , account.currentBalance
    //                 , account.name
    //                 , account.officialName
    //                 , account.type
    //                 , account.subType
    //             ];
    //             conn.query(Dao.composeQuery('updateAccount', params), params).then(rows => {
    //                 resolve(new Account(rows[0][0].id, rows[0][0].plaidItemId, rows[0][0].institutionName, rows[0][0].availableBalance, rows[0][0].currentBalance, rows[0][0].name, rows[0][0].officialName, rows[0][0].type, rows[0][0].subType));
    //             }).catch(err => { Dao.handleQueryCatch(err) });
    //         }).catch(err => { Dao.handleGetConnectionCatch(err); });
    //     });
    // }
}