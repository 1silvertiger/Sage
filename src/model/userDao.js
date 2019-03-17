// import { Connection } from './connection.js';
const User = require('./user.js');

// let conn;

// module.exports.test = function(message) {
//     console.log(message);
// }

// module.exports.initialize = function(pConn) {
//     conn = pConn;
// }

// module.exports.getById = function(id, conn) {
//     console.log('in function');
//         return new Promise(function (resolve, reject) {
//             conn.query('CALL getUserByGoogleId(?)', [id]).then(rows => {
//                 if (rows.length) {
//                     console.log('got a user');
//                     resolve(new User(rows.googleId, rows.firstName, rows.lastName, rows.imageUrl, rows.email));
//                     console.log('resolver user');
//                 } else
//                     resolve(null) ;
//             }).catch(err => {

//             });
//         });
//     }

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
                    console.log(rows[0][0]);
                    if (rows[0].length > 0) {
                        console.log(rows[0][0].googleId);
                        resolve(new User(rows[0][0].googleId, rows[0][0].firstName, rows[0][0].lastName, rows[0][0].imageUrl, rows[0][0].email));
                    } else
                        resolve(null);
                }).catch(err => {

                });
            }).catch();
        });
    }
}
