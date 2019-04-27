const Dao = require('./dao');
const TransactionItem = require('./transactionItem');

module.exports = class TransactionItemDao extends Dao {
    constructor(pPool) {
        super(pPool);
        this.Dao = new Dao(pPool);
    }

    createOrUpdate(transactionItem) {
        const pool = this.pool;
        const params = [
            transactionItem.id,
            transactionItem.transactionId,
            transactionItem.amount,
            transactionItem.note
        ]
        return new Promise(function(resolve, reject) {
            pool.query(Dao.composeQuery('createOrUpdateTransactionItem', params), params).then(rows => {
                const temp = new TransactionItem();
                resolve(temp);
            }).catch(err => {
                console.log(err);
                resolve(null);
            });
        })
    }

    createDefault(transaction) {
        return new Promise(function (resolve, reject) {
            createOrUpdate(new TransactionItem(
                null,
                transaction.id,
                transaction.amount,
                null,
                transaction.date,
                true
            )).then(transactionItem => {
                resolve(transactionItem);
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(null);
            });
        });
    }

    delete(id) {
        const pool = this.pool;
        return new Promise(function(resolve, reject) {
            pool.query('CALL deleteTransactionItem(?)', [id]).then(rows => {
                resolve(true);
            }).catch(err => {
                console.log(err);
                resolve(false);
            });
        });
    }
}