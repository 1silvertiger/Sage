const Dao = require('./dao');
const User = require('./user.js');
const Item = require('./item');

module.exports = class UserDao extends Dao {
    constructor(pPool) {
        super(pPool);
        this.Dao = new Dao();
    }

    test(message) {
        console.log(message);
    }

    create(user) {
        console.log('2');
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.getConnection().then(conn => {
                console.log('3')
                conn.query('CALL createUser(?,?,?,?,?)', [user.id, user.firstName, user.lastName, user.imageUrl, user.email]).then(rows => {
                    resolve(new User(rows[0][0].googleId, rows[0][0].firstName, rows[0][0].lastName, rows[0][0].imageUrl, rows[0][0].email));
                    conn.end();
                }).catch(err => {
                    console.log('err 1')
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
                        let items = new Array();
                        for (let i = 0; i < rows[1].length; i++) {
                            items.push(new Item(rows[1][i].itemId, rows[1][i].accessToken, null, rows[1][i].lastSync, new Array()));
                        }
                        resolve(new User(rows[0][0].googleId, rows[0][0].firstName, rows[0][0].lastName, rows[0][0].imageUrl, rows[0][0].email, items));
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
