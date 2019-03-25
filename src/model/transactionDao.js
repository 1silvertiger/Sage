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
                conn.query(Dao.composeQuery('createTransaction', params), params).then(rows => {
                    resolve(new Transaction(rows[0][0].id, rows[0][0].plaidItemId, rows[0][0].accountId, rows[0][0].amount, rows[0][0].merchant, rows[0][0].date, rows[0][0].name));
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
                }).catch(err => {
                    Dao.handleQueryCatch(err);
                });
            }).catch(err => {
                Dao.handleGetConnectionCatch(err);
            });
        });
    }
}