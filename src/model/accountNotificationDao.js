const Dao = require('./dao');
const AccountNotification = require('./accountNotification');

module.exports = class AccountNotificationDao extends Dao {
    constructor(pPool) {
        super(pPool);
        this.Dao = new Dao(pPool);
    }

    createOrUpdate(accountNotification) {
        const pool = this.pool;
        const params = [
            accountNotification.id,
            accountNotification.accountId,
            accountNotification.threshold,
            accountNotification.spendable || false
        ];
        return new Promise(function (resolve, reject) {
            pool.query(Dao.composeQuery('createOrUpdateAccountNotification', params), params).then(rows => {
                const temp = new AccountNotification(
                    rows[0][0].id,
                    rows[0][0].accountId,
                    rows[0][0].threshold,
                    rows[0][0].spendable
                );
                resolve(temp);
            }).catch(err => {
                console.log(err);
                resolve(null);
            });
        });
    }

    createOrUpdateBatch(accountId, notifications) {
        const pool = this.pool;
        const params = new Array();
        for (let i = 0; i < notifications.length; i++)
            params.push([
                notifications[i].id || null,
                notifications[i].accountId,
                notifications[i].threshold,
                notifications[i].spendable || false
            ]);
        return new Promise(function (resolve, reject) {
            pool.query('CALL deleteAllAccountNotificationsByAccountId(?)', [accountId]).then(() => {
                pool.batch(Dao.composeQuery('createOrUpdateAccountNotification', params[0]), params).then(rows => {
                    const notifications = new Array();
                    for (let i = 0; i < rows.length; i += 2)
                        notifications.push(new AccountNotification(
                            rows[i][0].id,
                            rows[i][0].accountId,
                            rows[i][0].threshold,
                            rows[i][0].spendable
                        ));
                    resolve(notifications);
                }).catch(err => {
                    Dao.handleQueryCatch(err);
                    resolve(null);
                });
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(null);
            });
        });
    }

    delete(id) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.query('CALL deleteAccountNotification(?)', [id]).then(rows => {
                resolve(true);
            }).catch(err => {
                console.log(err);
                resolve(false);
            });
        });
    }
}