module.exports = class Dao {
    constructor(pPool) {
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
        if (err.errno !== 45028)
            console.log(err);
    }
}