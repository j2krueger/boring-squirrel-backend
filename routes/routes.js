"use strict";

const globals = require('../helpers/globals');
const express = require('express');
const router = express.Router();
const cors = require('cors');
const userControllers = require('../controllers/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('../models/user');

passport.use(new LocalStrategy(User.passportVerify));

router.use(cors({
    origin: globals.corsAllowURLs,
    credentials: true
}));

passport.serializeUser(function (user, cb) {
    queueMicrotask(function () {
        cb(null, user.id);
    });
});

passport.deserializeUser(function (id, cb) {
    queueMicrotask(function () {
        return cb(null, User.findOne({ where: { id: id } }));
    });
});

// user related routes
router.post('/register', userControllers.registerUser);
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/loginError'
}));
router.get('/', userControllers.getRoot);
router.post('/', userControllers.getRoot);
router.post('/logout', userControllers.logoutUser);

module.exports = router;