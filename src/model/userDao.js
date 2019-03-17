const User = require('./user.js');

module.exports = class UserDao {
    constructor(pPool) {
        this.pool = pPool;
    }

    test(message) {
        console.log(message);
    }

    getById(id) {
        const pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.getConnection().then(conn => {
                conn.query('CALL getUserByGoogleId(?)', [id]).then(rows => {
                    console.log('rows: ');
                    console.log(rows);
                    if (rows[0].length > 0) {
                        delete rows[1].meta;
                        resolve(new User(rows[0][0].googleId, rows[0][0].firstName, rows[0][0].lastName, rows[0][0].imageUrl, rows[0][0].email, rows[1]));
                    } else
                        resolve(null);
                }).catch(err => {

                });
            }).catch();
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
