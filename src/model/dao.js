module.exports = class Dao {
    constructor(pPool, otherDaos) {
        this.pool = pPool;
    }

    static composeQuery(storedProc, params) {
        let query = 'CALL ' + storedProc + '(';
        for (let i = 0; i < params.length; i++)
            query += '?,';
        query = query.replace(/,$/, ')');
        return query;
    }

    static handleQueryCatch(err) {
        console.log(err);
    }

    static handleGetConnectionCatch(err) {
        console.log(err);
    }
}