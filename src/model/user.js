module.exports = class User {
    constructor(id, firstName, lastName, imageUrl, email, vapidSubscription, tags, items, budgetItems, piggyBanks, bills) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.imageUrl = imageUrl;
        this.email = email;
        this.vapidSubscription = vapidSubscription;
        this.tags = tags || new Array();
        this.items = items || new Array();
        this.budgetItems = budgetItems || new Array();
        this.piggyBanks = piggyBanks || new Array();
        this.bills = bills || new Array();
    }
}