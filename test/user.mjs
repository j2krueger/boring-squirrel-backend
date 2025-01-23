"use strict";

import * as testGlobals from './globals.mjs';

const {
    // resources
    expect,
    agent,
    // globals
    globals,
    // testString,
    // testUsername,
    // testEmail,
    // testPassword,
    // models
    User,
    // functions
    generateTestUser,
} = testGlobals;

const testUser = generateTestUser('2');

describe('Test the user handling routes', function () {
    describe('POST /register', function () {
        describe('Happy paths', function () {
            describe('POST /register with unique username, email, and password', function () {
                it('should return a 200 status and a success message', async function () {
                    const res = await agent.post('/register').send(testUser);

                    expect(res).to.have.status(200);
                    expect(res.body).to.deep.equal({ message: "User registered" });
                    const createdUser = await User.getUserByUsername(testUser.username);
                    expect(createdUser).to.not.be.null;

                    await createdUser.destroy();
                });
            });
        });

        describe('Sad paths', function () {
            describe('POST /register with duplicate username', function () {
                it('should return a 409 status and an error message', async function () {
                    const duplicateUserName = generateTestUser('DU');
                    duplicateUserName.username = generateTestUser('DT').username;

                    const res = await agent.post('/register').send(duplicateUserName);

                    expect(res).to.have.status(409);
                    expect(res.body).to.deep.equal({ error: "Username already in use." });
                });
            });

            describe('POST /register with a duplicate email', function () {
                it('should return a 409 status and an error message', async function () {
                    const duplicateEmail = generateTestUser('DE');
                    duplicateEmail.email = generateTestUser('DT').email;

                    const res = await agent.post('/register').send(duplicateEmail);

                    expect(res).to.have.status(409);
                    expect(res.body).to.deep.equal({ error: "Email already in use." });
                });
            });

            describe('POST /register with a missing username', function () {
                it('should return a 400 status and an error message', async function () {
                    const missingUsername = generateTestUser('MU');
                    missingUsername.username = undefined;

                    const res = await agent.post('/register').send(missingUsername);

                    expect(res).to.have.status(400);
                    expect(res.body).to.deep.equal({ error: "Missing username." });
                });
            });

            describe('POST /register with a missing email', function () {
                it('should return a 400 status and an error message', async function () {
                    const missingEmail = generateTestUser('ME');
                    missingEmail.email = undefined;

                    const res = await agent.post('/register').send(missingEmail);

                    expect(res).to.have.status(400);
                    expect(res.body).to.deep.equal({ error: "Missing email." });
                });
            });

            describe('POST /register with a missing password', function () {
                it('should return a 400 status and an error message', async function () {
                    const missingPassword = generateTestUser('MP');
                    missingPassword.password = undefined;

                    const res = await agent.post('/register').send(missingPassword);

                    expect(res).to.have.status(400);
                    expect(res.body).to.deep.equal({ error: "Missing password." });
                });
            });

            describe('POST /register with a too short password', function () {
                it('should return a 400 status and an error message', async function () {
                    const shortPassword = generateTestUser('SP');
                    shortPassword.password = 'x';

                    const res = await agent.post('/register').send(shortPassword);

                    expect(res).to.have.status(400);
                    expect(res.body).to.deep.equal({ error: 'Password must be at least ' + globals.minimumPasswordLength + ' characters long.' });
                });
            });

            describe('POST /register with a too long username', function () {
                it('should return a 400 status and an error message', async function () {
                    const longUsername = generateTestUser('LU');
                    longUsername.username = longUsername + 'x'.repeat(globals.maximumUsernameLength + 1);

                    const res = await agent.post('/register').send(longUsername);

                    expect(res).to.have.status(400);
                    expect(res.body).to.deep.equal({ error: "Username may not be longer than " + globals.maximumUsernameLength + " characters." });
                });
            });
        });
    });

    describe('POST /login', function () {
        describe('Happy paths', function () {
            describe('POST /login with valid credentials', function () {
                it('should redirect to /', async function () {
                    const res = await agent.post('/login').send(generateTestUser('DT'));

                    expect(res).to.redirectTo(globals.mochaTestingUrl + '/');
                });
            });
        });

        describe('Sad paths', function () {
            describe('POST /login with bad username', function () {
                it('should redirect to /loginError', async function () {
                    const badUsername = generateTestUser('DT');
                    badUsername.username = testGlobals.testString + testGlobals.testString;

                    const res = await agent.post('/login').send(badUsername);

                    expect(res).to.redirectTo(globals.mochaTestingUrl + '/loginError');
                });
            });

            describe('POST /login with bad password', function () {
                it('should redirect to /loginError', async function () {
                    const badPassword = generateTestUser('DT');
                    badPassword.password = testGlobals.testString + testGlobals.testString;

                    const res = await agent.post('/login').send(badPassword);

                    expect(res).to.redirectTo(globals.mochaTestingUrl + '/loginError');
                });
            });

            describe('POST /login with no username', function () {
                it('should redirect to /loginError', async function () {
                    const noUsername = generateTestUser('DT');
                    noUsername.username = undefined;

                    const res = await agent.post('/login').send(noUsername);

                    expect(res).to.redirectTo(globals.mochaTestingUrl + '/loginError');
                });
            });

            describe('POST /login with no password', function () {
                it('should redirect to /loginError', async function () {
                    const noPassword = generateTestUser('DT');
                    noPassword.password = undefined;

                    const res = await agent.post('/login').send(noPassword);

                    expect(res).to.redirectTo(globals.mochaTestingUrl + '/loginError');
                });
            });
        });
    });

    describe('POST /logout', function () {
        it('should always succede and redirect to /', async function () {
            const res = await agent.post('/logout');

            expect(res).to.redirectTo(globals.mochaTestingUrl + '/');
        });
    });

    describe('GET /', function () {
        describe('Check for user in session after logout', function () {
            it('should not have a passport.user property', async function () {
                const logoutRes = await agent.post('/logout');
                expect(logoutRes).to.redirectTo(globals.mochaTestingUrl + '/');

                const res = await agent.get('/');

                expect(res.body).to.not.have.nested.property('passport.user');
            });
        });

        describe('Check for user in session after login', function () {
            it('should have a passport.user property', async function () {
                const loginRes = await agent.post('/login').send(generateTestUser('DT'));
                expect(loginRes).to.redirectTo(globals.mochaTestingUrl + '/');

                const res = await agent.get('/');

                expect(res.body).to.have.nested.property('passport.user');
            });
        });
    });

    describe('GET /profile', function () {
        describe('Happy paths', function () {
            describe('GET /profile with logged in user', function () {
                it('should return a 200 status and return the private profile of the logged in user', async function () {
                    const loginRes = await agent.post('/login').send(generateTestUser('DT'));
                    expect(loginRes).to.redirectTo(globals.mochaTestingUrl + '/');

                    const res = await agent.get('/profile');
                    const user = await User.getUserByUsername(generateTestUser('DT').username);

                    expect(res).to.have.status(200);
                    expect(user).to.not.be.null;
                    for (const property of globals.privateProfileFields) {
                        expect(JSON.stringify(res.body[property])).to.deep.equal(JSON.stringify(user[property]));
                    }
                });
            });
        });

        describe('Sad paths', function () {
            describe('Get /profile with no logged in user', function () {
                it('should redirect to /login', async function () {
                    await agent.post('/logout');

                    const res = await agent.get('/profile');

                    expect(res).to.redirectTo(globals.mochaTestingUrl + '/login');
                });
            });
        });
    });
});