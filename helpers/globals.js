"use strict";

const process = require('process');
require("dotenv").config();

// Useful lengths of time
const oneSecondInMilliseconds = 1000;
const oneMinuteInMilliseconds = 60 * oneSecondInMilliseconds;
const oneHourInMilliseconds = 60 * oneMinuteInMilliseconds;
const oneDayInMilliseconds = 24 * oneHourInMilliseconds;
const oneWeekInMilliseconds = 7 * oneDayInMilliseconds;
const oneMonthInMilliseconds = 30 * oneDayInMilliseconds;
const oneYearInMilliseconds = 365 * oneDayInMilliseconds;

module.exports = {
    // Useful lengths of time
    oneSecondInMilliseconds,
    oneMinuteInMilliseconds,
    oneHourInMilliseconds,
    oneDayInMilliseconds,
    oneWeekInMilliseconds,
    oneMonthInMilliseconds,
    oneYearInMilliseconds,

    // Standardize these across the application
    loginExpirationTime: oneWeekInMilliseconds,
    passwordResetTime: 15 * oneMinuteInMilliseconds,
    minimumPasswordLength: 6,
    maximumUsernameLength: 20,
    saltRounds: 10,
    privateProfileFields: [
        "id",
        "username",
        "email",
        "createdAt",
        "updatedAt",
    ],

    // configuration values loaded from .env
    port: process.env.PORT,
    databaseURI: process.env.DATABASEURI,
    sessionSecret: process.env.SESSIONSECRET,
    localDeploy: process.env.LOCALDEPLOY,
    testing: process.env.TESTING,
    mochaTestingUrl: process.env.MOCHA_TESTING_URL,
    testString: process.env.TEST_STRING,
    corsAllowURLs: process.env.SERVER_URL.split(' '),
}
