"use strict";

const DB = require('./index');
const { DataTypes, Model } = require("sequelize");

class OAuth extends Model {
    static async getOAuth(provider, id) {
        return await OAuth.findOne({ where: { provider, id } });
    }
}

OAuth.init({
    id: {
        type: DataTypes.TEXT,
        primaryKey: true,
    },
    provider: {
        type: DataTypes.TEXT,
        primaryKey: true,
    },
    // userId: {
    // type: DataTypes.INTEGER,
    // },
},
    {
        sequelize: DB.sequelize,
    }
);

module.exports = OAuth;
