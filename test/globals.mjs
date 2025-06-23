"use strict";

import { expect, use } from 'chai';
import chaiHttp from "chai-http";
import User from '../models/user.js';
import IndependentGame from '../models/independentGame.js';

const chai = use(chaiHttp);
const globals = (await import('../helpers/globals.js')).default;
const agent = chai.request.agent(globals.mochaTestingUrl);

const { testString } = globals;
const testUsername = 'u' + testString;
const testEmail = testUsername + '@example.com';
const testPassword = testString;
const testBio = testString;

function generateTestUser(identifier) {
    return { username: identifier + testUsername, email: identifier + testEmail, password: identifier + testPassword, bio: identifier + testBio };
}

function generateTestUserLoginCredentials(identifier) {
    return { username: identifier + testUsername, password: identifier + testPassword }
}

export {
    // resources
    expect,
    agent,
    // globals
    globals,
    testString,
    testUsername,
    testEmail,
    testPassword,
    // models
    User,
    IndependentGame,
    // functions
    generateTestUser,
    generateTestUserLoginCredentials,
};