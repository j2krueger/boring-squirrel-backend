"use strict";

const DB = require('./index');
const User = require('./user');
const OAuth = require('./oauth');
const Newsletter = require('./newsletter');
const IndependentGame = require('./independentGame');


User.hasMany(OAuth);
OAuth.User = OAuth.belongsTo(User);

DB.sequelize.sync({ alter: true })
    .then(() => {
        console.log('  Database synced.');
    });

module.exports = {
    User,
    OAuth,
    Newsletter,
    IndependentGame,
};
