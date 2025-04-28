"use strict";

const User = require('../models/user');

async function userAuth(req, res, next) {
    if (req.authenticatedUser) { // We've already done this on this request, no need to hit the database again
        return next();
    }
    if (req?.session?.passport?.user) {
        const user = await User.findByPk(req.session.passport.user);
        if (user) {
            req.authenticatedUser = user;
            return next();
        }
    }
    res.redirect('/login');
}
async function userAuthNoRedirect(req, res, next) {
    if (req.authenticatedUser) { // We've already done this on this request, no need to hit the database again
        return next();
    }
    if (req?.session?.passport?.user) {
        const user = await User.findByPk(req.session.passport.user);
        if (user) {
            req.authenticatedUser = user;
            return next();
        }
    }
    return next();
}

module.exports = {
    userAuth,
    userAuthNoRedirect,
}