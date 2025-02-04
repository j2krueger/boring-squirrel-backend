"use strict";

const DB = require('./index');
const User = require('./user');
const OAuth = require('./oauth');


User.hasMany(OAuth);
OAuth.User = OAuth.belongsTo(User);

DB.sequelize.sync({ alter: true })
    .then(() => {
        console.log('  Database synced.');
    });

module.exports = DB.sequelize.models;
