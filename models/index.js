"use strict";

const globals = require('../helpers/globals');
const { Sequelize } = require('sequelize');

let sequelize;

if (globals.logging > 5) {
    sequelize = new Sequelize(globals.databaseURI, {
        logging: console.log,
    });
} else {
    sequelize = new Sequelize(globals.databaseURI, {
        logging: false,
    });
}
sequelize.authenticate({ logging: (sql) => { console.log(`Database: Testing database connection by ${sql}.`); } })
    .then(() => {
        console.log('Database: Connection has been established successfully.');
    })
    .catch((error) => {
        console.error('Database: Unable to connect to the database:', error);
    });

let DB = {};

DB.Sequelize = Sequelize;
DB.sequelize = sequelize;

DB.save = function (index, object) {
    DB[index] = object;
}

DB.load = function (index) {
    if (index in DB) {
        return DB[index];
    } else {
        return undefined;
    }
}

module.exports = DB;