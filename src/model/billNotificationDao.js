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
        return new Promise(function(resolve, reject) {
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
}