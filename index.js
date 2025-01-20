"use strict";

const globals = require('./helpers/globals');
const express = require("express");
const session = require('express-session');
const passport = require('passport');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const DB = require('./models/index');

if (globals.testing) {
    console.log('\n   globals: ', globals);
}

const morgan = require('morgan');

const app = express();

//middleware
app.use(express.json());
// app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.disable('x-powered-by');
app.use(morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        // "req.body:", JSON.stringify(req.body)
    ].join(' ');
}));

const myStore = new SequelizeStore({
    db: DB.sequelize
});
if (globals.localDeploy) {
    app.use(session({
        secret: globals.sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: myStore,
        cookie: {
            httpOnly: true,
            maxAge: globals.loginExpirationTime,
            sameSite: 'strict',
        }
    }));
} else {
    app.set('trust proxy', 1);
    app.use(session({
        secret: globals.sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: myStore,
        cookie: {
            httpOnly: true,
            maxAge: globals.loginExpirationTime,
            sameSite: 'none',
            secure: true,
        }
    }));
}
myStore.sync();

app.use(passport.authenticate('session'));

app.use('/', require('./routes/routes'));

app.listen(globals.port, () => {
    console.log(`Listening on port ${globals.port}`);
});