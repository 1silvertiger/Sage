const Dao = require('./dao');
const BillNotification = require('./billNotification');

module.exports = class BillNotificationDao extends Dao {
    constructor(pPool) {
        super(pPool);
        this.Dao = new Dao(pPool);
    }

    createOrUpdate(billNotification) {
        const pool = this.pool;
        const params = [
            billNotification.id,
            billNotification.billId,
            billNotification.periodId,
            billNotification.periodsBeforeBillIsDue
        ];
        return new Promise(function (resolve, reject) {
            pool.query(Dao.composeQuery('createOrUpdateBillNotification', params), params).then(rows => {
                const temp = new BillNotification(
                    rows[0][0].id,
                    rows[0][0].billId,
                    rows[0][0].periodId,
                    rows[0][0].periodsBeforeBillIsDue
                );
                resolve(temp);
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(null);
            });
        });
    }

    createOrUpdateBatch(billNotifications) {
        const pool = this.pool;
        const params = new Array();
        for (let i = 0; i < billNotifications.length; i++)
            params.push([
                billNotifications[i].id || null,
                billNotifications[i].billId,
                billNotifications[i].periodId,
                billNotifications[i].periodsBeforeBillIsDue
            ]);
        return new Promise(function (resolve, reject) {
            pool.batch(Dao.composeQuery('createOrUpdateBillNotification', params[0]), params).then(rows => {
                const notifications = new Array();
                for (let i = 0; i < rows.length; i += 2)
                    notifications.push(new BillNotification(
                        rows[i][0].id,
                        rows[i][0].billId,
                        rows[i][0].periodId,
                        rows[i][0].periodsBeforeBillIsDue
                    ));
                resolve(notifications);
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(null);
            });
        });
    }

    delete(id) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.query('CALL deleteBillNotification(?)', [id]).then(rows => {
                resolve(true);
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(false);
            });
        });
    }

    deleteAllByBillId(billId) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.query('CALL deleteAllBillNotificationsByBillId(?)', [billId]).then(rows => {
                resolve(true);
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(false);
            });
        });
    }
}