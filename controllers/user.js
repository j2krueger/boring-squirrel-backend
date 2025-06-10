"use strict";

const globals = require('../helpers/globals');
const bcrypt = require('bcrypt');
const { minimumPasswordLength, maximumUsernameLength, saltRounds } = globals;
const { User } = require('../models/combined');
// const OAuth = require('../models/oauth');

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

async function getRoot(req, res) {
    return res.status(200).json(req.session);
}

function logoutUser(req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
}

function getProfile(req, res) {
    let result = req?.authenticatedUser?.privateProfile();
    if (result) {
        return res.status(200).json(req.authenticatedUser.privateProfile());
    } else {
        return res.status(404).json({ error: "No user logged in." });
    }

}

async function putProfile(req, res, next) {
    try {
        const result = await req.authenticatedUser.applySettings(req.body);
        req.session.user = result;
        res.status(200).json(result.privateProfile());
    } catch (error) {
        if (error.code) {
            return res.status(error.code).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

async function getUsers(req, res) {
    try {
        const users = await User.findAll();
        const summaries = users.map(user => user.publicProfile());
        return res.status(200).json(summaries);
    } catch (error) {
        res.status(500).json(error);
    }
}

async function getLeaderboard(req, res) {
    return res.status(200).json({
        highestWinLossRatio: [
            { username: "apmanager", wins: 1, losses: 0 },
            { username: "john", wins: 0, losses: 1 },
        ],
        mostWins: [
            { username: "apmanager", wins: 1 },
            { username: "john", wins: 0 },
        ],
        mostPlays: [
            { username: "john", plays: 1 },
            { username: "apmanager", plays: 1 },
        ],
    });
}

module.exports = {
    registerUser,
    // loginUser,
    getRoot,
    logoutUser,
    getProfile,
    putProfile,
    getUsers,
    getLeaderboard,
};