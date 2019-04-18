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
                bill.name,
                bill.amount,
                bill.autoPay,
                bill.weekDay,
                bill.numOfPeriods,
                bill.paid || null,
                bill.dueDate
            ];
            pool.query(Dao.composeQuery('createOrUpdateBill', params), params).then(rows => {
                const temp = new Bill(
                    rows[0][0].id, 
                    rows[0][0].userId, 
                    rows[0][0].periodId, 
                    rows[0][0].accountId, 
                    rows[0][0].name, 
                    rows[0][0].amount, 
                    rows[0][0].autoPay, 
                    rows[0][0].weekDay, 
                    rows[0][0].numOfPeriods, 
                    rows[0][0].paid, 
                    rows[0][0].dueDate
                );
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