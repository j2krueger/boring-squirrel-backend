"use strict";

const DB = require('./index');
const { DataTypes, Model } = require("sequelize");
// const globals = require('../helpers/globals');
const bcrypt = require('bcrypt');
const globals = require('../helpers/globals');

class User extends Model {
    static async passportVerify(username, password, done) {
        let user;
        try {
            user = (await User.getUserByUsername(username)) || (await User.getUserByEmail(username));
        } catch (error) {
            return done(error);
        }
        if (!user) {
            return done(null, false, { message: "Incorrect username or password." });
        }
        if (!await bcrypt.compare(password, user.passwordHash)) {
            return done(null, false, { message: "Incorrect username or password." });
        }
        return done(null, user);
    }

    static async passportGoogleVerify(req, accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }

    static async getUserByOauth(provider, id) {
        const oauth = await DB.sequelize.models.OAuth.findOne({ where: { provider, id }, include: User });
        return oauth?.User;
    }

    static async getUserByUsername(username) {
        const foundUser = await User.findOne({
            where: {
                username: username,
            },
        });
        return foundUser;
    }

    static async getUserByEmail(email) {
        const foundUser = await User.findOne({
            where: {
                email: email,
            },
        });
        return foundUser;
    }

    privateProfile() {
        const result = {};
        for (const property of globals.privateProfileFields) {
            result[property] = this[property];
        }
        return result;
    }
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true,
        },
        passwordHash: {
            type: DataTypes.TEXT,
        },
    },
    {
        sequelize: DB.sequelize,
    }
);

/* class User {
    constructor(username, email, passwordHash) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    save() {
        DB.save(this.username, { username: this.username, email: this.email, passwordHash: this.passwordHash });
        DB.save(this.email, { username: this.username, email: this.email, passwordHash: this.passwordHash });
    }


}
 */

module.exports = User;
