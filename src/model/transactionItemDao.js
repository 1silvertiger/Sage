const Dao = require('./dao');
const TagDao = require('./tagDao');
const TransactionItem = require('./transactionItem');

module.exports = class TransactionItemDao extends Dao {
    constructor(pPool) {
        super(pPool);
        this.Dao = new Dao(pPool);
        this.tagDao = new TagDao(pPool);
    }

    createOrUpdate(transactionItem) {
        const pool = this.pool;
        const params = [
            transactionItem.id,
            transactionItem.transactionId,
            transactionItem.amount,
            transactionItem.note
        ]
        return new Promise(function (resolve, reject) {
            pool.query(Dao.composeQuery('createOrUpdateTransactionItem', params), params).then(rows => {
                const temp = new TransactionItem(
                    rows[i][0].id,
                    rows[0][0].transactionId,
                    rows[0][0].amount,
                    rows[0][0].note,
                    new Date(rows[0][0].appliedDate),
                    rows[0][0].default === 1,
                    new Array()
                );
                resolve(temp);
            }).catch(err => {
                console.log(err);
                resolve(null);
            });
        })
    }

    save(transactionId, transactionItems) {
        const pool = this.pool;
        const tagDao = this.tagDao;
        return new Promise(function (resolve, reject) {
            pool.query('CALL deleteAllTransactionItemsByTransactionId(?)', [transactionId]).then(rows => {
                if (transactionItems.length) {
                    const params = new Array();
                    const promises = new Array();
                    for (let i = 0; i < transactionItems.length; i++) {
                        console.log(transactionItems[i]);
                        params.push([
                            transactionItems[i].id || null,
                            transactionItems[i].transactionId,
                            transactionItems[i].amount,
                            transactionItems[i].appliedDate,
                            transactionItems[i].default
                        ]);

                        promises.push(tagDao.createOrUpdateBatch(transactionItems[i].tags));
                    }
                    promises.unshift(pool.batch(Dao.composeQuery('createOrUpdateTransactionItem', params[0]), params));

                    Promise.all(promises).then(values => {
                        const newTransactionItems = new Array();
                        const tagParams = new Array();
                        for (let i = 0; i < values[0].length; i += 2) {
                            newTransactionItems.push(new TransactionItem(
                                values[0][i][0].id,
                                values[0][i][0].transactionId,
                                values[0][i][0].amount,
                                values[0][i][0].note,
                                new Date(values[0][i][0].appliedDate),
                                values[0][i][0].default === 1,
                                values[i / 2 + 1]
                            ));
                            // console.log(newTransactionItems[i]);
                            if (values[i].length) {
                                const tagIds = [
                                    values[0][i][0].id
                                ];
                                // console.log('tag ids: \n' + tagIds);
                                for (let j = 0; j < values[i / 2 + 1].length; j++)
                                    tagIds.push(values[i / 2 + 1][j].id);
                                // console.log('tag ids: \n' + tagIds);
                                // console.log('tag params: \n' + tagParams);
                                tagParams.push(tagIds);
                                // console.log('tag params: \n' + tagParams);
                            }
                        }

                        resolve(newTransactionItems);
                        // console.log('tag params: \n' + tagParams);
                        tagDao.tagTransactionItemsBatch(tagParams);
                    })

                    // pool.batch(Dao.composeQuery('createOrUpdateTransactionItem', params[0]), params).then(rows => {
                    //     const newTransactionItems = new Array();
                    //     for (let i = 0; i < rows.length; i += 2) {
                    //         if (transactionItems[i / 2].tags.length) {
                    //             tagDao.createOrUpdateBatch(transactionItems[i / 2].tags).then(tags => {
                    //                 newTransactionItems.push(new TransactionItem(
                    //                     rows[i][0].id,
                    //                     rows[i][0].transactionId,
                    //                     rows[i][0].amount,
                    //                     rows[i][0].note,
                    //                     new Date(rows[i][0].appliedDate),
                    //                     rows[i][0].default === 1,
                    //                     tags
                    //                 ));
                    //             }).catch(err => {
                    //                 resolve(null);
                    //                 Dao.handleQueryCatch(err);
                    //             });
                    //         } else {
                    //             newTransactionItems.push(new TransactionItem(
                    //                 rows[i][0].id,
                    //                 rows[i][0].transactionId,
                    //                 rows[i][0].amount,
                    //                 rows[i][0].note,
                    //                 new Date(rows[i][0].appliedDate),
                    //                 rows[i][0].default === 1,
                    //                 new Array()
                    //             ));
                    //         }
                    //     }
                    //     resolve(newTransactionItems);
                    // }).catch(err => {
                    //     resolve(null);
                    //     Dao.handleQueryCatch(err);
                    // });
                } else {
                    resolve(new Array());
                }
            }).catch(err => {
                resolve(null);
                Dao.handleQueryCatch(err);
            });
        });
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
        return new Promise(function (resolve, reject) {
            pool.query('CALL deleteTransactionItem(?)', [id]).then(rows => {
                resolve(true);
            }).catch(err => {
                console.log(err);
                resolve(false);
            });
        });
    }
}