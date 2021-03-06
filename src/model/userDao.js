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
const BillNotification = require('./billNotification');

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

module.exports = class UserDao extends Dao {
    constructor(pPool) {
        super(pPool);
        this.Dao = new Dao();
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
                    //console.log('rows: ');
                    // console.log(rows);
                    if (rows[0].length > 0) {
                        // Create user object
                        const user = new User(
                            rows[USER_INDEX][0].googleId,
                            rows[USER_INDEX][0].firstName,
                            rows[USER_INDEX][0].lastName,
                            rows[USER_INDEX][0].imageUrl,
                            rows[USER_INDEX][0].email,
                            JSON.parse(rows[USER_INDEX][0].vapidSubscription)
                        );

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
                                for (let i = accountNotificationIndex; i < rows[ACCOUNT_NOTIFICATIONS_INDEX].length; i++) {
                                    if (rows[ACCOUNT_NOTIFICATIONS_INDEX][i].accountId === rows[ACCOUNTS_INDEX][accountIndex].id) {
                                        accountNotificationIndex++;
                                        accountNotifications.push(new AccountNotification(
                                            rows[ACCOUNT_NOTIFICATIONS_INDEX][i].id,
                                            rows[ACCOUNT_NOTIFICATIONS_INDEX][i].accountId,
                                            rows[ACCOUNT_NOTIFICATIONS_INDEX][i].threshold,
                                            rows[ACCOUNT_NOTIFICATIONS_INDEX][i].spendable
                                        ));
                                    }
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
                                && rows[TRANSACTIONS_INDEX][transactionIndex].plaidItemId === rows[ITEMS_INDEX][i].itemId) {
                                // Transaction items
                                const transactionItems = new Array();
                                for (let i = transactionItemIndex; i < rows[TRANSACTION_ITEMS_INDEX].length; i++) {
                                    if (rows[TRANSACTION_ITEMS_INDEX][i].transactionId === rows[TRANSACTIONS_INDEX][transactionIndex].id) {
                                        // Get tags
                                        const tags = new Array();
                                        for (let j = transactionItemTagIndex; j < rows[TRANSACTION_ITEM_TAGS_INDEX].length; j++) {
                                            if (rows[TRANSACTION_ITEM_TAGS_INDEX][j].transactionItemId === rows[TRANSACTION_ITEMS_INDEX][transactionItemIndex].id) {
                                                transactionItemTagIndex++;
                                                tags.push(new Tag(
                                                    rows[TRANSACTION_ITEM_TAGS_INDEX][j].id,
                                                    rows[TRANSACTION_ITEM_TAGS_INDEX][j].userId,
                                                    rows[TRANSACTION_ITEM_TAGS_INDEX][j].name
                                                ));
                                            }
                                        }
                                        transactionItemIndex++;
                                        transactionItems.push(new TransactionItem(
                                            rows[TRANSACTION_ITEMS_INDEX][i].id,
                                            rows[TRANSACTION_ITEMS_INDEX][i].transactionId,
                                            rows[TRANSACTION_ITEMS_INDEX][i].amount,
                                            rows[TRANSACTION_ITEMS_INDEX][i].note,
                                            rows[TRANSACTION_ITEMS_INDEX][i].appliedDate,
                                            rows[TRANSACTION_ITEMS_INDEX][i].default,
                                            tags
                                        ));
                                    }
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
                                rows[ITEMS_INDEX][i].userId,
                                rows[ITEMS_INDEX][i].accessToken,
                                rows[ITEMS_INDEX][i].institutionName,
                                rows[ITEMS_INDEX][i].lastSync,
                                accounts,
                                transactions
                            );

                            user.items.push(item);
                        }

                        // Budget items
                        let budgetItemTagIndex = 0;
                        for (let i = 0; i < rows[BUDGET_ITEMS_INDEX].length; i++) {
                            // Budget item tags
                            const tags = new Array();
                            for (budgetItemTagIndex; budgetItemTagIndex < rows[BUDGET_ITEM_TAGS_INDEX].length; budgetItemTagIndex++) {
                                if (rows[BUDGET_ITEM_TAGS_INDEX][budgetItemTagIndex].budgetItemId === rows[BUDGET_ITEMS_INDEX][i].id) {
                                    tags.push(new Tag(
                                        rows[BUDGET_ITEM_TAGS_INDEX][budgetItemTagIndex].id,
                                        rows[BUDGET_ITEM_TAGS_INDEX][budgetItemTagIndex].userId,
                                        rows[BUDGET_ITEM_TAGS_INDEX][budgetItemTagIndex].name
                                    ));
                                } else {
                                    break;
                                }
                            }
                            user.budgetItems.push(new Budget(
                                rows[BUDGET_ITEMS_INDEX][i].id,
                                rows[BUDGET_ITEMS_INDEX][i].userId,
                                rows[BUDGET_ITEMS_INDEX][i].periodId,
                                rows[BUDGET_ITEMS_INDEX][i].name,
                                rows[BUDGET_ITEMS_INDEX][i].amount,
                                rows[BUDGET_ITEMS_INDEX][i].numOfPeriods,
                                tags
                            ));
                        }

                        // Piggy banks
                        let piggyBankTagIndex = 0;
                        for (let i = 0; i < rows[PIGGY_BANKS_INDEX].length; i++) {
                            // Piggy bank tags
                            const tags = new Array();
                            for (piggyBankTagIndex; piggyBankTagIndex < rows[PIGGY_BANK_TAGS_INDEX].length; piggyBankTagIndex++) {
                                if (rows[PIGGY_BANK_TAGS_INDEX][piggyBankTagIndex].piggyBankId === rows[PIGGY_BANKS_INDEX][i].id) {
                                    tags.push(new Tag(
                                        rows[PIGGY_BANK_TAGS_INDEX][piggyBankTagIndex].tagId,
                                        rows[PIGGY_BANK_TAGS_INDEX][piggyBankTagIndex].userId,
                                        rows[PIGGY_BANK_TAGS_INDEX][piggyBankTagIndex].name
                                    ));
                                } else {
                                    break;
                                }
                            }

                            user.piggyBanks.push(new PiggyBank(
                                rows[PIGGY_BANKS_INDEX][i].id,
                                rows[PIGGY_BANKS_INDEX][i].userId,
                                rows[PIGGY_BANKS_INDEX][i].accountId,
                                rows[PIGGY_BANKS_INDEX][i].name,
                                rows[PIGGY_BANKS_INDEX][i].balance,
                                rows[PIGGY_BANKS_INDEX][i].goal,
                                tags
                            ));
                        }

                        // Piggy bank tags
                        // let currentPiggyBank = user.piggyBanks[0];
                        // let currentPiggyBankIndex = 0;
                        // for (let i = 0; i < rows[PIGGY_BANK_TAGS_INDEX].length; i++) {
                        //     if (rows[PIGGY_BANK_TAGS_INDEX][i].piggyBankId !== currentPiggyBank.id)
                        //         currentPiggyBank = user.piggyBanks[++currentPiggyBankIndex];
                        //     user.piggyBanks[currentPiggyBankIndex].tags.push(new Tag(
                        //         rows[PIGGY_BANK_TAGS_INDEX][i].id, rows[PIGGY_BANK_TAGS_INDEX][i].userId, rows[PIGGY_BANK_TAGS_INDEX][i].name
                        //     ));
                        // }

                        // Bills
                        let billNotificationIndex = 0;
                        for (let billIndex = 0; billIndex < rows[BILLS_INDEX].length; billIndex++) {
                            // Bill notifications
                            const billNotifications = new Array();
                            for (let i = billNotificationIndex; i < rows[BILL_NOTIFICATIONS_INDEX].length; i++) {
                                if (rows[BILL_NOTIFICATIONS_INDEX][i].billId === rows[BILLS_INDEX][billIndex].id) {
                                    billNotificationIndex++;
                                    billNotifications.push(new BillNotification(
                                        rows[BILL_NOTIFICATIONS_INDEX][i].id,
                                        rows[BILL_NOTIFICATIONS_INDEX][i].billId,
                                        rows[BILL_NOTIFICATIONS_INDEX][i].periodId,
                                        rows[BILL_NOTIFICATIONS_INDEX][i].periodsBeforeBillIsDue
                                    ));
                                }
                            }

                            const temp = new Bill(
                                rows[BILLS_INDEX][billIndex].id,
                                rows[BILLS_INDEX][billIndex].userId,
                                rows[BILLS_INDEX][billIndex].periodId,
                                rows[BILLS_INDEX][billIndex].accountId,
                                rows[BILLS_INDEX][billIndex].name,
                                rows[BILLS_INDEX][billIndex].amount,
                                rows[BILLS_INDEX][billIndex].weekDay === 1,
                                rows[BILLS_INDEX][billIndex].numOfPeriods,
                                rows[BILLS_INDEX][billIndex].paidThisPeriod === 1,
                                rows[BILLS_INDEX][billIndex].dueDate,
                                billNotifications,
                            );
                            user.bills.push(temp);
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

    updateVapidSubscription(userId, subscription) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.query('CALL updateVapidSubscriptionByUserId(?,?)', [userId, subscription]).catch(err => {
                Dao.handleQueryCatch(err);
                resolve(false);
            });
        });
    }
}
