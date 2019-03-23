// import {Transaction} from './transaction.js';
// import {TransactionDao } from './transactionDao.js';

module.exports = class Account {
    constructor(id, plaidItemId, institutionName, availableBalance, currentBalance, name, officialName, type, subType) {
        this.id = id;
        this.plaidItemId = plaidItemId;
        this.institutionName = institutionName;
        this.availableBalance = availableBalance;
        this.currentBalance = currentBalance;
        this.name = name;
        this.officialName = officialName;
        this.type = type;
        this.subType = subType;
    }

}