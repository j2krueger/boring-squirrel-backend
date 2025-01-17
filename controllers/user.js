"use strict";

const globals = require('../helpers/globals');
const bcrypt = require('bcrypt');
const { minimumPasswordLength, maximumUsernameLength, saltRounds } = globals;
const User = require('../models/user');

async function registerUser(req, res) {
    if (!req.body?.password) {
        return res.status(400).json({ error: "Missing password." });
    }
    if (req.body.password.length < minimumPasswordLength) {
        return res.status(400).json({ error: 'Password must be at least ' + minimumPasswordLength + ' characters long.' });
    }
    const username = req.body?.username;
    const email = req.body?.email;
    const passwordHash = await bcrypt.hash(req.body?.password, saltRounds);
    if (!username) {
        res.status(400).json({ error: "Missing username." });
    } else if (username.length > maximumUsernameLength) {
        res.status(400).json({ error: "Username may not be longer than " + maximumUsernameLength + " characters." });
    } else if (!email) {
        res.status(400).json({ error: "Missing email." });
    } else if ((await User.getUserByUsername(username))) {
        res.status(409).json({ error: "Username already in use." });
    } else if ((await User.getUserByEmail(email))) {
        res.status(409).json({ error: "Email already in use." });
    } else {
        try {
            await User.create({ username, email, passwordHash });
        } catch (error) {
            res.status(500).json({ error: error });
        }
        res.status(200).json({ message: "User registered" });
    }
}


/* async function loginUser(req, res, next) {
    const name = req.body?.name;
    const password = req.body?.password;
    if (!name) {
        return res.status(400).json({ error: "Missing name." });
    } else if (!password) {
        return res.status(400).json({ error: "Missing password." });
    } else {
        const user = await User.findOne({ username: name }) || await User.findOne({ email: name });
        if (!user || !await bcrypt.compare(password, user.passwordHash)) {
            return res.status(401).json({ error: "Incorrect name or password." });
        } else {
            req.session.regenerate(function (error) {
                if (error) next(error);
                req.session.user = user;
                req.session.save(async function (error) {
                    if (error) next(error);
                    const fullUser = await User.findByIdAndPopulate(user._id);
                    return res.status(200).json(fullUser.privateProfile());
                });
            });
        }
    }
} */

async function getRoot(req, res) {
    return res.status(200).json(req.session);
}

function logoutUser(req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
}


module.exports = {
    registerUser,
    // loginUser,
    getRoot,
    logoutUser,
};