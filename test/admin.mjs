"use strict";

import * as testGlobals from './globals.mjs';
import * as crypto from 'crypto';

const {
    // resources
    expect,
    agent,
    // globals
    globals,
    testString,
    // testUsername,
    // testEmail,
    // testPassword,
    // models
    User,
    IndependentGame,
    // functions
    generateTestUser,
    generateTestUserLoginCredentials,
} = testGlobals;

describe('Test the admin routes', function () {
    let admin;
    let adminPass;

    before('Setup admin user for testing admin routes', async function () {
        // It is possible that test entries might be left in the database after a failed test run, and that an attacker
        // could guess the test password, but we don't want to give the attacker access to an account with admin priveleges,
        // so we'll use a big, random, secure password, generated fresh for each round of tests.
        adminPass = crypto.randomBytes(64).toString('hex');
        const adminBody = generateTestUser('ad');
        adminBody.password = adminPass;
        const res = await agent.post('/register').send(adminBody);
        expect(res).to.have.status(200);
        admin = await User.findOne({ where: { username: adminBody.username } });
        admin.admin = true;
        await admin.save();
    });

    after('Teardown admin user for testing admin routes', async function () {
        await admin.destroy();
    });

    describe('Test the GET /admin/independentgame route', function () {
        describe('Happy paths', function () {
            describe('Login as admin and GET /admin/independentgame', function () {
                let independentGame;

                before('Setup an entry in the IndependentGame table for testing', async function () {

                    const independentGameBody = {
                        gameName: testString,
                        description: "test description",
                        imageUrl: "https://www.example.com/" + testString + ".jpg",
                        tag1: "test",
                        tag2: "tag2",
                        tag3: "tag3",
                        category: "test category",
                        linkUrl: "https://www.example.com/" + testString,
                        email: testString + "@example.com",
                        additionalInfo: "additional test info"
                    };
                    const res = await agent.post('/independentgame').send(independentGameBody);
                    expect(res).to.have.status(200);
                    independentGame = await IndependentGame.findByPk(res.body.id);
                    expect(independentGame?.id).to.deep.equal(res.body.id);
                });

                after('Teardown test entry in IndependentGames table', async function () {
                    await independentGame.destroy();
                });

                it('should return status 200 and an array of all entries in the IndependentGames table', async function () {
                    const loginCredentials = generateTestUserLoginCredentials('ad');
                    loginCredentials.password = adminPass;
                    const loginRes = await agent.post('/login').send(loginCredentials);
                    expect(loginRes).to.redirectTo(globals.mochaTestingUrl + '/');

                    const res = await agent.get('/admin/independentgame');

                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    const testEntry = res.body.find(a => a.id = independentGame.id);
                    expect(testEntry?.id).to.deep.equal(independentGame.id);
                });
            });
        });

        describe('Sad paths', function () {
            describe('logout and GET /admin/independentgame', function () {
                it('should redirect to /login', async function () {
                    const logoutRes = await agent.post('/logout');
                    expect(logoutRes).to.redirectTo(globals.mochaTestingUrl + '/');

                    const res = await agent.get('/admin/independentgame');
                    expect(res).to.redirectTo(globals.mochaTestingUrl + '/login');
                });
            });

            describe('login as non-admin and GET /admin/independentgame', function () {
                it('should redirect to /login', async function () {
                    const loginCredentials = generateTestUserLoginCredentials('DT')
                    const loginRes = await agent.post('/login').send(loginCredentials);
                    expect(loginRes).to.redirectTo(globals.mochaTestingUrl + '/');

                    const res = await agent.get('/admin/independentgame');
                    expect(res).to.redirectTo(globals.mochaTestingUrl + '/login');
                });
            });
        });
    });
});