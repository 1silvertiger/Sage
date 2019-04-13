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
        return new Promise(function(resolve, reject) {
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

    delete(id) {
        const pool = this.pool;
        return new Promise(function(resolve, reject) {
            pool.query('CALL deleteAccountNotification(?)', [id]).then(rows => {
                resolve(true);
            }).catch(err => {
                console.log(err);
                resolve(false);
            });
        });
    }
}