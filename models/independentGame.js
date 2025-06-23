"use strict";

const DB = require('./index');
const { DataTypes, Model } = require("sequelize");
// const globals = require('../helpers/globals');

class IndependentGame extends Model {
    // static async getIndependentGame(id) {
    //     return await IndependentGame.findOne({ where: { id } });
    // }
}


IndependentGame.init(
    {
        gameName: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        imageUrl: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        tag1: {
            type: DataTypes.TEXT,
        },
        tag2: {
            type: DataTypes.TEXT,
        },
        tag3: {
            type: DataTypes.TEXT,
        },
        category: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        linkUrl: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        additionalInfo: {
            type: DataTypes.TEXT,
        },
        verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        sequelize: DB.sequelize,
    }
);

module.exports = IndependentGame;