const Dao = require('./dao');
const User = require('./user.js');
const Item = require('./item');
const Budget = require('./budget');
const Tag = require('./tag');
const PiggyBank = require('./piggyBank');

const USER_INDEX = 0;
const TAGS_INDEX = 1;
const ITEMS_INDEX = 2;
const BUDGET_ITEMS_INDEX = 3;
const PIGGY_BANK_INDEX = 4;
const PIGGY_BANK_TAGS_INDEX = 5;

module.exports = class UserDao extends Dao {
    constructor(pPool) {
        super(pPool);
        this.Dao = new Dao();
    }

    test(message) {
        console.log(message);
    }

    create(user) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.getConnection().then(conn => {
                conn.query('CALL createUser(?,?,?,?,?)', [user.id, user.firstName, user.lastName, user.imageUrl, user.email]).then(rows => {
                    resolve(new User(rows[0][0].googleId, rows[0][0].firstName, rows[0][0].lastName, rows[0][0].imageUrl, rows[0][0].email));
                    conn.end();
                }).catch(err => {
                    console.log(err)
                });
            }).catch(err => {
                Dao.handleGetConnectionCatch();
            });
        });
    }

    getById(id) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.getConnection().then(conn => {
                conn.query('CALL getUserByGoogleId(?)', [id]).then(rows => {
                    console.log('rows: ');
                    console.log(rows);
                    if (rows[0].length > 0) {
                        //Create user object
                        const user = new User(rows[USER_INDEX][0].googleId, rows[USER_INDEX][0].firstName, rows[USER_INDEX][0].lastName, rows[USER_INDEX][0].imageUrl, rows[USER_INDEX][0].email);

                        //Tags
                        for (let i = 0; i < rows[TAGS_INDEX].length; i++) {
                            user.tags.push(new Tag(rows[TAGS_INDEX][i].id, rows[TAGS_INDEX][i].userId, rows[TAGS_INDEX][i].name));
                        }

                        //Plaid items
                        for (let i = 0; i < rows[ITEMS_INDEX].length; i++) {
                            user.items.push(new Item(rows[ITEMS_INDEX][i].itemId, rows[ITEMS_INDEX][i].accessToken, rows[ITEMS_INDEX][i].institutionName, rows[ITEMS_INDEX][i].lastSync, new Array()));
                        }

                        //Budget items
                        for (let i = 0; i < rows[BUDGET_ITEMS_INDEX].length; i++) {
                            user.budgetItems.push(new Budget(
                                rows[BUDGET_ITEMS_INDEX][i].id
                                , rows[BUDGET_ITEMS_INDEX][i].userId
                                , rows[BUDGET_ITEMS_INDEX][i].periodId
                                , rows[BUDGET_ITEMS_INDEX][i].name
                                , rows[BUDGET_ITEMS_INDEX][i].amount
                                , rows[BUDGET_ITEMS_INDEX][i].numOfPeriods
                            ));
                        }

                        //Piggy banks
                        for (let i = 0; i < rows[PIGGY_BANK_INDEX].length; i++) {
                            user.piggyBanks.push(new PiggyBank(
                                rows[PIGGY_BANK_INDEX][i].id,
                                rows[PIGGY_BANK_INDEX][i].userId,
                                rows[PIGGY_BANK_INDEX][i].accountId,
                                rows[PIGGY_BANK_INDEX][i].tagId,
                                rows[PIGGY_BANK_INDEX][i].name,
                                rows[PIGGY_BANK_INDEX][i].balance,
                                rows[PIGGY_BANK_INDEX][i].goal
                            ));
                        }

                        //Piggy bank tags
                        let currentPiggyBank = user.piggyBanks[0];
                        let currentPiggyBankIndex = 0;
                        for (let i = 0; i < rows[PIGGY_BANK_TAGS_INDEX].length; i++) {
                            if (rows[PIGGY_BANK_TAGS_INDEX][i].piggyBankId !== currentPiggyBank.id)
                                currentPiggyBank = user.piggyBanks[++currentPiggyBankIndex];
                            user.piggyBanks[currentPiggyBankIndex].tags.push(new Tag(
                                rows[PIGGY_BANK_TAGS_INDEX][i].id, rows[PIGGY_BANK_TAGS_INDEX][i].userId, rows[PIGGY_BANK_TAGS_INDEX][i].name
                            ));
                        }

                        resolve(user);
                    } else
                        resolve(null);
                    conn.end();
                }).catch(err => {
                    Dao.handleQueryCatch(err);
                });
            }).catch(err => {
                Dao.handleGetConnectionCatch(err);
            });
        });
    }

    // constructor(pConn) {
    //     this.conn = pConn;
    //     console.log('got connection');
    // }

    // getById(id) {
    //     console.log('in method');
    //     const conn = this.conn;
    //     console.log('conn exists');
    //     return new Promise(function (resolve, reject) {
    //         console.log('in userdao promise');
    //         conn.query('CALL getUserByGoogleId(?)', [id]).then(rows => {
    //             console.log('in userdao query');
    //             console.log('rows: ');
    //             console.log(rows);
    //             if (rows) {
    //                 console.log(rows[0]);
    //                 resolve(new User(rows[0].googleId, rows[0].firstName, rows[0].lastName, rows[0].imageUrl, rows[0].email));
    //             } else
    //                 resolve(null);
    //         }).catch(err => {
    //             console.log('error in usedao query');
    //         });
    //     });
    // }
}
