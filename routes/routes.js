"use strict";

const globals = require('../helpers/globals');
const express = require('express');
const router = express.Router();
const cors = require('cors');
const userControllers = require('../controllers/user');
const miscControllers = require('../controllers/misc');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth20');
const { User, OAuth } = require('../models/combined');
const auth = require('../helpers/auth');

passport.use(new LocalStrategy(User.passportVerify));

passport.use(new GoogleStrategy(
    {
        clientID: globals.googleClientId,
        clientSecret: globals.googleClientSecret,
        callbackURL: globals.googleCallbackUrl,
        passReqToCallback: true,
    },
    User.passportGoogleVerify));

router.use(cors({
    origin: globals.corsAllowURLs,
    credentials: true
}));

passport.serializeUser(function (profile, cb) {
    queueMicrotask(async function () {
        if (profile?.provider) {
            const user = await User.getUserByOauth(profile.provider, profile.id);
            if (!user) {
                // create user or link to existing user
                const oauth = await OAuth.create(
                    {
                        provider: profile.provider,
                        id: profile.id,
                        User: {
                            username: profile.displayName,
                            email: profile.emails?.[0]?.value,
                        },
                    },
                    {
                        include: [OAuth.User],
                    }
                );
                cb(null, oauth.User.id);
            } else {
                cb(null, user.id);
            }
        } else {
            cb(null, profile.id);
        }
    });
});

passport.deserializeUser(function (id, cb) {
    queueMicrotask(function () {
        return cb(null, User.findByPk(id));
    });
});

// user related routes
router.post('/register', userControllers.registerUser);
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));
router.get('/login', function (req, res) {
    res.status(200).json({
        body: req.body,
        query: req.query,
    })
});
router.get('/', userControllers.getRoot);
router.post('/', userControllers.getRoot);
router.post('/logout', userControllers.logoutUser);
router.get('/profile', auth.userAuthNoRedirect, userControllers.getProfile);
router.put('/profile', auth.userAuth, userControllers.putProfile);
router.get('/users', userControllers.getUsers);
router.get('/leaderboard', userControllers.getLeaderboard);

// misc routes
router.post('/newsletter', miscControllers.newsletter);

// Google SSO routes implemented right here
router.get('/google',
    passport.authenticate('google', {
        scope: [
            "email",
            "profile",
            // "openid"
        ],
    }),
);
router.get('/google/callback',
    passport.authenticate("google", {
        access_type: "offline",
    }),
    (req, res) => {
        if (!req.user) {
            return res.status(400).json({ error: "Authentication failed" });
        }

        // return user details
        // res.redirect('/');
        res.redirect('https://boringsquirrel.com/account');
    });

module.exports = router;