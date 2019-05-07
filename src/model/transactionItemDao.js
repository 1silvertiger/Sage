const Dao = require('./dao');
const TagDao = require('./tagDao');
const TransactionItem = require('./transactionItem');
const BudgetItem = require('./budget');

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

    getRecentSortedByTag(date) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.query('CALL getRecentTransactionItemsSortedByTag(?)', [date]).then(rows => {
                const map = new Array();
                const tempTransactionItems = new Array();
                let currentTagId = -1;
                for (let i = 0; i < rows[0].length; i++) {
                    if (rows[0][i].tagId != currentTagId) {
                        map.push([currentTagId, tempTransactionItems]);
                        currentTagId = rows[0][i].tagId;
                        tempTransactionItems.length = 0;
                    } else {
                        tempTransactionItems.push(new TransactionItem(
                            rows[0][i].id,
                            rows[0][i].transactionId,
                            rows[0][i].amount,
                            rows[0][i].note,
                            new Date(rows[0][i]),
                            rows[0][i].defaut === 1,
                            null
                        ));
                    }
                }
                resolve(map);
            }).catch(err => {
                Dao.handleQueryCatch(err);
            });
        });
    }

    getRecentSortedByBudgetItem(date) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.query('CALL getRecentTransactionItemsSortedByBudgetItem(?)', [date]).then(rows => {
                const map = new Array();
                const tempTransactionItems = new Array();
                let currentBudgetItemId = rows[0][0].budgetItemId;
                console.log(rows[0].length);
                for (let i = 0; i < rows[0].length; i++) {
                    if (rows[0][i].budgetItemId !== currentBudgetItemId) {
                        map.push([
                            new BudgetItem(
                                rows[0][i].budgetItemId,
                                rows[0][i].userId,
                                rows[0][i].periodId,
                                rows[0][i].budgetItemName,
                                rows[0][i].budgetItemAmount,
                                rows[0][i].numOfPeriods,
                                null
                            ),
                            tempTransactionItems
                        ]);
                        currentBudgetItemId = rows[0][i].budgetItemId;
                        tempTransactionItems.length = 0;
                    } else {
                        tempTransactionItems.push(new TransactionItem(
                            rows[0][i].transactionItemId,
                            rows[0][i].transactionId,
                            rows[0][i].transactionItemAmount,
                            rows[0][i].note,
                            new Date(rows[0][i].appliedDate),
                            rows[0][i].default === 1,
                            null
                        ));
                    }
                }
                resolve(map);
            }).catch(err => {
                resolve(null);
                Dao.handleQueryCatch(err);
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