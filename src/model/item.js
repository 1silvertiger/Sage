// import {Account} from './account.js';
module.exports = class Item {
    constructor(pId, pAccessToken, pLastSync) {
        this.id = pId;
        this.accessToken = pAccessToken;
        this.lastSync = pLastSync;
    }
}