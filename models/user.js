"use strict";

const DB = require('./index');
const { DataTypes, Model } = require("sequelize");
const bcrypt = require('bcrypt');
const globals = require('../helpers/globals');

class User extends Model {
    static async passportVerify(username, password, done) {
        try {
            const user = (await User.getUserByUsername(username)) || (await User.getUserByEmail(username));
            if (!user) {
                return done(null, false, { message: "Incorrect username or password." });
            }
            if (!(user.passwordHash && await bcrypt.compare(password, user.passwordHash))) {
                return done(null, false, { message: "Incorrect username or password." });
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
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
        if (this.id) {
            const result = {};
            for (const property of globals.privateProfileFields) {
                result[property] = this[property];
            }
            return result;
        } else {
            return {};
        }
    }

    publicProfile() {
        if (this.id) {
            const result = {};
            for (const property of globals.publicProfileFields) {
                result[property] = this[property];
            }
            return result;
        } else {
            return {};
        }
    }

    summaryProfile() {
        if (this.id) {
            const result = {};
            for (const property of globals.summaryProfileFields) {
                result[property] = this[property];
            }
            return result;
        } else {
            return {};
        }
    }

    async applySettings(settings) {
        const userSettable = {
            username: "string",
            email: "string",
            password: "string",
            bio: "string",
        }

        // console.log(`Settings: set to ${JSON.stringify(settings, null, 4)}`);
        for (const key in settings) {
            if (!(key in userSettable && typeof settings[key] == userSettable[key])) {
                const error = new Error("Invalid request.");
                error.code = 400;
                throw error;
            }
        }
        if (settings.username) {
            if (settings.username == this.username) {
                delete settings.username;
            } else {
                const result = await User.findOne({ where: { username: settings.username } });
                if (result) {
                    const error = new Error("Invalid request: That username is already in use.");
                    error.code = 409;
                    throw error;
                }
            }
        }
        if (settings.email) {
            if (settings.email == this.email) {
                delete settings.email;
            } else {
                const result = await User.findOne({ where: { email: settings.email } });
                if (result) {
                    const error = new Error("Invalid request: That email is already in use.");
                    error.code = 409;
                    throw error;
                }
            }
        }
        if (settings.password) {
            if (this.passwordHash && await bcrypt.compare(settings.password, this.passwordHash)) {
                delete settings.password;
            } else {
                this.passwordHash = await bcrypt.hash(settings.password, globals.saltRounds);
            }
            delete settings.password;
        }
        for (const key in settings) {
            this[key] = settings[key];
        }
        // if (settings.email) {
        //     this.unverifyEmail();
        // }
        return (await this.save());
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
        bio: {
            type: DataTypes.TEXT,
        },
        passwordHash: {
            type: DataTypes.TEXT,
        },
        admin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }
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
