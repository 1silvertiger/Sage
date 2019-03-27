const Dao = require('./dao');
const Transaction = require('./transaction');
const TransactionItemDao = require('./transactionItemDao');
const TransactionItem = require('./transactionItem');

module.exports = class TransactionDao extends Dao {
    constructor(pPool) {
        super(pPool);
        this.Dao = new Dao();
    }

    create(transaction) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.getConnection().then(conn => {
                const params = [
                    transaction.id
                    , transaction.plaidItemId
                    , transaction.accountId
                    , transaction.amount
                    , transaction.merchant
                    , transaction.date
                ];
                conn.query(Dao.composeQuery('createOrUpdateTransaction', params), params).then(rows => {
                    resolve(new Transaction(rows[0][0].id, rows[0][0].plaidItemId, rows[0][0].accountId, rows[0][0].amount, rows[0][0].merchant, rows[0][0].date, rows[0][0].name));
                }).catch(err => {
                    Dao.handleQueryCatch(err);
                    resolve(null);
                }).finally(() => {if(conn) conn.end()});
            }).catch(err => {
                Dao.handleGetConnectionCatch(err);
                resolve(null);
            });
        });
    }

    batchCreate(transactions) {
        const pool = this.pool;
        const params = new Array();
        for (let i = 0; i < transactions.length; i++) {
            params.push([
                transactions[i].id
                , transactions[i].plaidItemId
                , transactions[i].accountId
                , transactions[i].amount
                , transactions[i].merchant
                , transactions[i].date
            ]);
        }
        return new Promise(function(resolve, reject) {
            pool.batch(Dao.composeQuery2('createTransaction', params[0].length), params).then(rows => {
                const transactionsFromDb = new Array();
                for (let i = 0; i < transactions.length * 2; i += 2) {
                    transactionsFromDb.push(new Transaction(
                        rows[i][0].id
                        , rows[i][0].plaidItemId
                        , rows[i][0].accountId
                        , rows[i][0].amount
                        , rows[i][0].merchant
                        , rows[i][0].date
                    ));
                }
                resolve(transactionsFromDb);
            }).catch(err => {
                Dao.handleQueryCatch(err);
            });
        });
    }

    getAllByItemId(itemId) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.getConnection().then(conn => {
                conn.query('CALL getAllTransactionsByItemId(?)', [itemId]).then(rows => {
                    const transactions = new Array();
                    for (let i = 0; i < rows[0].length; i++) {
                        transactions.push(new Transaction(
                            rows[0][i].id
                            , rows[0][i].plaidItemId
                            , rows[0][i].accountId
                            , rows[0][i].amount
                            , rows[0][i].merchant
                            , rows[0][i].date
                            , null
                            , null
                            , null
                        ));
                    }
                    resolve(transactions);
                }).catch(err => {
                    Dao.handleQueryCatch(err);
                }).finally(() => {
                    if(conn) 
                        conn.end()
                });
            }).catch(err => {
                Dao.handleGetConnectionCatch(err);
            });
        });
    }
}