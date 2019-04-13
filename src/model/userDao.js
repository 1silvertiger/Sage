const Dao = require('./dao');
const User = require('./user.js');
const Tag = require('./tag');
const Item = require('./item');
const Account = require('./account');
const AccountNotification = require('./accountNotification');
const Transaction = require('./transaction');
const TransactionItem = require('./transactionItem');
const Budget = require('./budget');
const PiggyBank = require('./piggyBank');
const Bill = require('./bill');

const USER_INDEX = 0;
const TAGS_INDEX = 1;
const ITEMS_INDEX = 2;
const ACCOUNTS_INDEX = 3;
const ACCOUNT_NOTIFICATIONS_INDEX = 4;
const TRANSACTIONS_INDEX = 5;
const TRANSACTION_ITEMS_INDEX = 6;
const TRANSACTION_ITEM_TAGS_INDEX = 7;
const BUDGET_ITEMS_INDEX = 8;
const BUDGET_ITEM_TAGS_INDEX = 9;
const PIGGY_BANKS_INDEX = 10;
const PIGGY_BANK_TAGS_INDEX = 11;
const BILLS_INDEX = 12;
const BILL_NOTIFICATIONS_INDEX = 13;
const BILL_TAGS_INDEX = 14;

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
                        // Create user object
                        const user = new User(rows[USER_INDEX][0].googleId, rows[USER_INDEX][0].firstName, rows[USER_INDEX][0].lastName, rows[USER_INDEX][0].imageUrl, rows[USER_INDEX][0].email);

                        // Tags
                        for (let i = 0; i < rows[TAGS_INDEX].length; i++) {
                            user.tags.push(new Tag(rows[TAGS_INDEX][i].id, rows[TAGS_INDEX][i].userId, rows[TAGS_INDEX][i].name));
                        }

                        let accountIndex = 0;
                        let accountNotificationIndex = 0;
                        let transactionIndex = 0;
                        let transactionItemIndex = 0;
                        let transactionItemTagIndex = 0;
                        // Plaid items
                        for (let i = 0; i < rows[ITEMS_INDEX].length; i++) {
                            // Accounts
                            const accounts = new Array();
                            while (rows[ACCOUNTS_INDEX].length > accountIndex 
                                && rows[ACCOUNTS_INDEX][accountIndex].plaidItemId === rows[ITEMS_INDEX][i].itemId) {
                                // Account notifications
                                const accountNotifications = new Array();
                                while (rows[ACCOUNT_NOTIFICATIONS_INDEX].length > accountNotificationIndex 
                                    && rows[ACCOUNT_NOTIFICATIONS_INDEX][accountNotificationIndex].accountId === rows[ACCOUNTS_INDEX][accountIndex].id) {
                                    accountNotifications.push(new AccountNotification(
                                        rows[ACCOUNT_NOTIFICATIONS_INDEX][accountNotificationIndex].id,
                                        rows[ACCOUNT_NOTIFICATIONS_INDEX][accountNotificationIndex].accountId,
                                        rows[ACCOUNT_NOTIFICATIONS_INDEX][accountNotificationIndex].threshold,
                                        rows[ACCOUNT_NOTIFICATIONS_INDEX][accountNotificationIndex].spendable
                                    ));
                                    if (++accountNotificationIndex === rows[ACCOUNT_NOTIFICATIONS_INDEX].length)
                                        break;
                                }

                                accounts.push(new Account(
                                    rows[ACCOUNTS_INDEX][accountIndex].id,
                                    rows[ACCOUNTS_INDEX][accountIndex].plaidItemId,
                                    rows[ACCOUNTS_INDEX][accountIndex].institutionName,
                                    rows[ACCOUNTS_INDEX][accountIndex].availableBalance,
                                    rows[ACCOUNTS_INDEX][accountIndex].currentBalance,
                                    rows[ACCOUNTS_INDEX][accountIndex].name,
                                    rows[ACCOUNTS_INDEX][accountIndex].officialName,
                                    rows[ACCOUNTS_INDEX][accountIndex].type,
                                    rows[ACCOUNTS_INDEX][accountIndex].subType,
                                    accountNotifications
                                ));
                                if (++accountIndex === rows[ACCOUNTS_INDEX].length)
                                    break;
                            }

                            // Transactions
                            const transactions = new Array();
                            while (rows[TRANSACTIONS_INDEX].length > transactionIndex 
                                // && rows[TRANSACTIONS_INDEX][transactionIndex].plaidItemId 
                                && rows[TRANSACTIONS_INDEX][transactionIndex].plaidItemId === rows[ITEMS_INDEX][i].itemId) {
                                // Transaction items
                                const transactionItems = new Array();
                                while (rows[TRANSACTION_ITEMS_INDEX].length > transactionItemIndex 
                                    && rows[TRANSACTION_ITEMS_INDEX][transactionItemIndex].transactionId 
                                    === rows[TRANSACTIONS_INDEX][transactionIndex].id) {
                                    // Transaction item tags
                                    const tags = new Array();
                                    while (rows[TRANSACTION_ITEM_TAGS_INDEX].length > transactionItemTagIndex
                                        && rows[TRANSACTION_ITEM_TAGS_INDEX][transactionItemTagIndex].transactionId 
                                        === rows[TRANSACTION_ITEMS_INDEX][transactionItemIndex].id) {
                                        tags.push(new Tag(
                                            rows[TRANSACTION_ITEM_TAGS_INDEX][transactionItemTagIndex].id,
                                            rows[TRANSACTION_ITEM_TAGS_INDEX][transactionItemTagIndex].userId,
                                            rows[TRANSACTION_ITEM_TAGS_INDEX][transactionItemTagIndex].name
                                        ));
                                        if (++transactionItemTagIndex === rows[TRANSACTION_ITEM_TAGS_INDEX].length)
                                            break;
                                    }
                                    transactionItems.push(new TransactionItem(
                                        rows[TRANSACTION_ITEMS_INDEX][transactionItemIndex].id,
                                        rows[TRANSACTION_ITEMS_INDEX][transactionItemIndex].transactionId,
                                        rows[TRANSACTION_ITEMS_INDEX][transactionItemIndex].amount,
                                        rows[TRANSACTION_ITEMS_INDEX][transactionItemIndex].note,
                                        tags
                                    ));
                                    if (++transactionItemIndex === rows[TRANSACTION_ITEMS_INDEX].length)
                                        break;
                                }
                                transactions.push(new Transaction(
                                    rows[TRANSACTIONS_INDEX][transactionIndex].id,
                                    rows[TRANSACTIONS_INDEX][transactionIndex].plaidItemId,
                                    rows[TRANSACTIONS_INDEX][transactionIndex].accountId,
                                    rows[TRANSACTIONS_INDEX][transactionIndex].amount,
                                    rows[TRANSACTIONS_INDEX][transactionIndex].merchant,
                                    rows[TRANSACTIONS_INDEX][transactionIndex].date,
                                    transactionItems
                                ));
                                if (++transactionIndex === rows[TRANSACTIONS_INDEX].length)
                                    break;
                            }

                            const item = new Item(
                                rows[ITEMS_INDEX][i].itemId,
                                rows[ITEMS_INDEX][i].accessToken,
                                rows[ITEMS_INDEX][i].institutionName,
                                rows[ITEMS_INDEX][i].lastSync,
                                accounts,
                                transactions
                            );

                            user.items.push(item);
                        }

                        // Budget items
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

                        // Budget item tags

                        // Piggy banks
                        for (let i = 0; i < rows[PIGGY_BANKS_INDEX].length; i++) {
                            user.piggyBanks.push(new PiggyBank(
                                rows[PIGGY_BANKS_INDEX][i].id,
                                rows[PIGGY_BANKS_INDEX][i].userId,
                                rows[PIGGY_BANKS_INDEX][i].accountId,
                                rows[PIGGY_BANKS_INDEX][i].tagId,
                                rows[PIGGY_BANKS_INDEX][i].name,
                                rows[PIGGY_BANKS_INDEX][i].balance,
                                rows[PIGGY_BANKS_INDEX][i].goal
                            ));
                        }

                        // Piggy bank tags
                        let currentPiggyBank = user.piggyBanks[0];
                        let currentPiggyBankIndex = 0;
                        for (let i = 0; i < rows[PIGGY_BANK_TAGS_INDEX].length; i++) {
                            if (rows[PIGGY_BANK_TAGS_INDEX][i].piggyBankId !== currentPiggyBank.id)
                                currentPiggyBank = user.piggyBanks[++currentPiggyBankIndex];
                            user.piggyBanks[currentPiggyBankIndex].tags.push(new Tag(
                                rows[PIGGY_BANK_TAGS_INDEX][i].id, rows[PIGGY_BANK_TAGS_INDEX][i].userId, rows[PIGGY_BANK_TAGS_INDEX][i].name
                            ));
                        }

                        // Bills
                        for (let i = 0; i < rows[BILLS_INDEX].length; i++) {
                            const temp1 = new Date(rows[BILLS_INDEX][i].dueDate);
                            const temp = new Bill(
                                rows[BILLS_INDEX][i].id,
                                rows[BILLS_INDEX][i].userId,
                                rows[BILLS_INDEX][i].periodId,
                                rows[BILLS_INDEX][i].accountId,
                                new Tag(rows[BILLS_INDEX][i].tagId, rows[BILLS_INDEX][i].userId, rows[BILLS_INDEX][i].name),
                                rows[BILLS_INDEX][i].name,
                                rows[BILLS_INDEX][i].amount,
                                rows[BILLS_INDEX][i].autoPay === 1,
                                rows[BILLS_INDEX][i].weekDay === 1,
                                new Date(rows[BILLS_INDEX][i].dueDate),
                                rows[BILLS_INDEX][i].dueDate2 ? new Date(rows[BILLS_INDEX][i].dueDate2) : null,
                                rows[BILLS_INDEX][i].paid === 1
                            );
                            user.bills.push(temp);
                        }

                        // Bill notifications

                        // Bill tags

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
