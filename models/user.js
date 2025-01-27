"use strict";

const DB = require('./index');
const { DataTypes, Model } = require("sequelize");
// const globals = require('../helpers/globals');
const bcrypt = require('bcrypt');
const globals = require('../helpers/globals');
// const { minimumPasswordLength, maximumUsernameLength, saltRounds } = globals;

class User extends Model {
    static async passportVerify(username, password, cb) {
        let user;
        try {
            user = (await User.getUserByUsername(username))||(await User.getUserByEmail(username));
        } catch (error) {
            return cb(error);
        }
        if (!user) {
            return cb(null, false, { message: "Incorrect username or password." });
        }
        if (!await bcrypt.compare(password, user.passwordHash)) {
            return cb(null, false, { message: "Incorrect username or password." });
        }
        return cb(null, user);
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
            allowNull: false,
        },
    },
    {
        sequelize: DB.sequelize,
    }
);

User.sync({ alter: true });


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
