"use strict";

const DB = require('./index');
const { DataTypes, Model } = require("sequelize");

class Newsletter extends Model {
    static async getNewsletter(id) {
        return await Newsletter.findOne({ where: { id } });
    }
}

Newsletter.init(
    {
        address: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize: DB.sequelize,
    }
);

module.exports = Newsletter;
