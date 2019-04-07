const Dao = require('./dao');
const Bill = require('./bill');
const Tag = require('./tag');

module.exports = class BillDao extends Dao {
    constructor(pPool) {
        super(pPool);
        this.Dao = new Dao(pPool);
    }

    createOrUpdate(bill) {
        const pool = this.pool;
        const tagDao = this.TagDao;
        return new Promise(function(resolve, reject) {
            const params = [
                bill.id || null,
                bill.userId,
                bill.periodId || null,
                bill.accountId || null,
                bill.tag.id || null,
                bill.name,
                bill.amount,
                bill.autoPay,
                bill.weekDay,
                bill.startDate,
                bill.startDate2 || null
            ];
            pool.query(Dao.composeQuery('createOrUpdateBill', params), params).then(rows => {
                const tempTag = new Tag(rows[1][0].id, rows[1][0].userId, rows[1][0].name);
                const temp = new Bill(rows[0][0].id, rows[0][0].userId, rows[0][0].periodId, rows[0][0].accountId, tepmTag, rows[0][0].name, rows[0][0].amount, rows[0][0].autoPay, rows[0][0].weekDay, rows[0][0].startDate, rows[0][0].startDate2);
                resolve(temp);
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(null);
            });
        });
    }

    deleteBatch(ids) {
        const pool = this.pool;
        return new Promise(function(resolve, reject) {
            pool.batch('CALL deleteBill(?)', ids).then(rows => {
                resolve(true);
            }).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(false);
            });
        });
    }
}