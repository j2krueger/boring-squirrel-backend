"use strict";

const User = require('../models/user');

async function grabLoggedInUser(req) {
    if (req.authenticatedUser) { // We've already done this on this request, no need to hit the database again
        return;
    }
    if (req?.session?.passport?.user) {
        const user = await User.findByPk(req.session.passport.user);
        if (user) {
            req.authenticatedUser = user;
            return;
        }
    }
}

async function adminAuth(req, res, next) {
    await grabLoggedInUser(req);
    if (req.authenticatedUser?.admin) {
        return next();
    }
    res.redirect('/login');
}

async function userAuth(req, res, next) {
    await grabLoggedInUser(req);
    if (req.authenticatedUser) {
        return next();
    }
    res.redirect('/login');
}

async function userAuthNoRedirect(req, res, next) {
    await grabLoggedInUser(req);
    return next();
}

module.exports = {
    adminAuth,
    userAuth,
    userAuthNoRedirect,
}