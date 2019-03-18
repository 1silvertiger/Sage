const Item = require('./item');
// const ItemDao = require('./itemDao');

module.exports = class User {
    constructor(id, firstName, lastName, imageUrl, email, items) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.imageUrl = imageUrl;
        this.email = email;
        this.items = items;

        // this.items = ItemDao.getAllByUserId(this.id);
    }
}