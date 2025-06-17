"use strict";

import * as testGlobals from './globals.mjs';
import * as bcrypt from 'bcrypt';

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
    generateTestUserLoginCredentials,
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
            describe('POST /login with valid username and password', function () {
                it('should redirect to /', async function () {
                    const user = generateTestUser('DT');
                    const loginCredentials = { username: user.username, password: user.password };

                    const res = await agent.post('/login').send(loginCredentials);

                    expect(res).to.redirectTo(globals.mochaTestingUrl + '/');
                });
            });

            describe('POST /login with valid email and password', function () {
                it('should redirect to /', async function () {
                    const user = generateTestUser('DT');
                    const loginCredentials = { username: user.email, password: user.password };

                    const res = await agent.post('/login').send(loginCredentials);

                    expect(res).to.redirectTo(globals.mochaTestingUrl + '/');
                });
            });
        });

        describe('Sad paths', function () {
            describe('POST /login with bad username', function () {
                it('should redirect to /login', async function () {
                    const user = generateTestUser('DT');
                    const loginCredentials = { username: user.username + user.username, password: user.password };

                    const res = await agent.post('/login').send(loginCredentials);

                    expect(res).to.redirectTo(globals.mochaTestingUrl + '/login');
                });
            });

            describe('POST /login with bad password', function () {
                it('should redirect to /login', async function () {
                    const user = generateTestUser('DT');
                    const loginCredentials = { username: user.username, password: user.password + "bad" };

                    const res = await agent.post('/login').send(loginCredentials);

                    expect(res).to.redirectTo(globals.mochaTestingUrl + '/login');
                });
            });

            describe('POST /login with no username', function () {
                it('should redirect to /login', async function () {
                    const user = generateTestUser('DT');
                    const loginCredentials = { password: user.password };

                    const res = await agent.post('/login').send(loginCredentials);

                    expect(res).to.redirectTo(globals.mochaTestingUrl + '/login');
                });
            });

            describe('POST /login with no password', function () {
                it('should redirect to /login', async function () {
                    const user = generateTestUser('DT');
                    const loginCredentials = { username: user.username };

                    const res = await agent.post('/login').send(loginCredentials);

                    expect(res).to.redirectTo(globals.mochaTestingUrl + '/login');
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
                it('should return a 404 status and an error message', async function () {
                    await agent.post('/logout');

                    const res = await agent.get('/profile');

                    expect(res).to.have.status(404);
                    expect(res.body).to.deep.equal({ "error": "No user logged in." });
                });
            });
        });
    });

    describe('PUT /profile', function () {
        let testUser, testUserID;

        beforeEach('Setup testUser to be modified and login as testUser', async function () {
            testUser = generateTestUser('PP');
            const regRes = await agent.post('/register').send(testUser);
            expect(regRes).to.have.status(200);
            const newUser = await User.getUserByUsername(testUser.username);
            expect(newUser.id).to.exist;
            testUserID = newUser.id;
            const loginRes = await agent.post('/login').send(testUser);
            expect(loginRes).to.have.status(200);
        });

        afterEach('Teardown modified testUser', async function () {
            await agent.post('/logout');
            const dbRes = await User.findByPk(testUserID);
            await dbRes.destroy();
        });

        describe('Happy paths', function () {
            describe('PUT /profile with logged in user', function () {
                describe('PUT new username', function () {
                    it('should return a 200 status and the updated data, and update the database', async function () {
                        const username = 'new' + testUser.username;
                        let updatedTestUser = testUser;
                        updatedTestUser.username = username;
                        delete updatedTestUser.password;
                        delete updatedTestUser.bio;
                        const res = await agent.put('/profile').send({ username });
                        const dbUser = await User.findByPk(testUserID);

                        expect(res).to.have.status(200);
                        expect(res.body).to.include(updatedTestUser);
                        expect(dbUser.username).to.deep.equal(username);
                    });
                });

                describe('PUT new email address', function () {
                    it('should return a 200 status and the updated data, and update the database', async function () {
                        const email = 'new' + testUser.email;
                        let updatedTestUser = testUser;
                        updatedTestUser.email = email;
                        delete updatedTestUser.password;
                        delete updatedTestUser.bio;
                        const res = await agent.put('/profile').send({ email });
                        const dbUser = await User.findByPk(testUserID);

                        expect(res).to.have.status(200);
                        expect(res.body).to.include(updatedTestUser);
                        expect(dbUser.email).to.deep.equal(email);
                    });
                });

                describe('PUT new password', function () {
                    it('should return a 200 status and the updated data, and update the database', async function () {
                        const password = 'new' + testUser.email;
                        let updatedTestUser = testUser;
                        updatedTestUser.password = password;
                        delete updatedTestUser.password;
                        delete updatedTestUser.bio;
                        const res = await agent.put('/profile').send({ password });
                        const dbUser = await User.findByPk(testUserID);

                        expect(res).to.have.status(200);
                        expect(res.body).to.include(updatedTestUser);
                        // expect(dbUser.password).to.deep.equal(password);
                        expect(await bcrypt.compare(password, dbUser.passwordHash)).to.be.true;
                    });
                });

                describe('PUT new bio', function () {
                    it('should return a 200 status and the updated data, and update the database', async function () {
                        const bio = 'new' + testUser.bio;
                        let updatedTestUser = testUser;
                        updatedTestUser.bio = bio;
                        delete updatedTestUser.password;
                        const res = await agent.put('/profile').send({ bio });
                        const dbUser = await User.findByPk(testUserID);

                        expect(res).to.have.status(200);
                        expect(res.body).to.include(updatedTestUser);
                        expect(dbUser.bio).to.deep.equal(bio);
                    });
                });

                describe('PUT with all fields', function () {
                    it('should return a 200 status and the updated data, and update the database', async function () {
                        const username = 'new' + testUser.username;
                        const email = 'new' + testUser.email;
                        const password = 'new' + testUser.password;
                        const bio = 'new' + testUser.bio;
                        let updatedTestUser = { username, email, password, bio };

                        const res = await agent.put('/profile').send(updatedTestUser);
                        delete updatedTestUser.password;
                        const dbUser = await User.findByPk(testUserID);

                        expect(res).to.have.status(200);
                        expect(res.body).to.include(updatedTestUser);
                        expect(dbUser.username).to.deep.equal(username);
                        expect(dbUser.email).to.deep.equal(email);
                        expect(dbUser.bio).to.deep.equal(bio);
                        expect(await bcrypt.compare(password, dbUser.passwordHash)).to.be.true;
                    });
                });
            });
        });

        describe('Sad paths', function () {
            describe('PUT with no logged in user', function () {
                it('should redirect to /login', async function () {
                    await agent.post('/logout');

                    const res = await agent.put('/profile').send({ bio: "bio" });

                    expect(res).to.redirectTo(globals.mochaTestingUrl + '/login');
                });
            });

            describe('PUT with logged in user but...', function () {
                describe('PUT with duplicate username', function () {
                    it('should return a 409 status and an error message', async function () {
                        const duplicateUsername = generateTestUser('DT').username;

                        const res = await agent.put('/profile').send({ username: duplicateUsername });

                        expect(res).to.have.status(409);
                        expect(res.body).to.deep.equal({ error: "Invalid request: That username is already in use." })
                    });
                });

                describe('PUT with username not a string', function () {
                    it('should return a 400 status and an error message', async function () {
                        const res = await agent.put('/profile').send({ username: [] });

                        expect(res).to.have.status(400);
                        expect(res.body).to.deep.equal({ error: "Invalid request." });
                    });
                });

                describe('PUT with duplicate email', function () {
                    it('should return a 409 status and an error message', async function () {
                        const duplicateEmail = generateTestUser('DT').email;

                        const res = await agent.put('/profile').send({ email: duplicateEmail });

                        expect(res).to.have.status(409);
                        expect(res.body).to.deep.equal({ error: "Invalid request: That email is already in use." })
                    });
                });

                describe('PUT with email not a string', function () {
                    it('should return a 400 status and an error message', async function () {
                        const res = await agent.put('/profile').send({ email: [] });

                        expect(res).to.have.status(400);
                        expect(res.body).to.deep.equal({ error: "Invalid request." });
                    });
                });

                describe('PUT with password not a string', function () {
                    it('should return a 400 status and an error message', async function () {
                        const res = await agent.put('/profile').send({ password: [] });

                        expect(res).to.have.status(400);
                        expect(res.body).to.deep.equal({ error: "Invalid request." });
                    });
                });

                describe('PUT with bio not a string', function () {
                    it('should return a 400 status and an error message', async function () {
                        const res = await agent.put('/profile').send({ bio: [] });

                        expect(res).to.have.status(400);
                        expect(res.body).to.deep.equal({ error: "Invalid request." });
                    });
                });

                describe('PUT with non-settable field', function () {
                    it('should return a 400 status and an error message', async function () {
                        const res = await agent.put('/profile').send({ noseWeasel: "Nose Weasel" });

                        expect(res).to.have.status(400);
                        expect(res.body).to.deep.equal({ error: "Invalid request." });
                    });
                });
            });
        });
    });

    describe('GET /users', function () {
        describe('Happy paths', function () {
            describe('Login and GET', function () {
                it('should return a status of 200 and a list of users', async function () {
                    const loginRes = await agent.post('/login').send(generateTestUserLoginCredentials('DT'));
                    expect(loginRes).to.redirectTo(globals.mochaTestingUrl + '/');
                    const userList = JSON.parse(JSON.stringify(await User.findAll({ attributes: globals.summaryProfileFields })));

                    const res = await agent.get('/users');
                    expect(res).to.have.status(200);
                    expect(res.body).to.deep.equal(userList);
                });
            });

            describe('Logout and GET', function () {
                it('should return a status of 200 and a list of users', async function () {
                    const loRes = await agent.post('/logout');
                    expect(loRes).to.redirectTo(globals.mochaTestingUrl + '/');
                    const userList = JSON.parse(JSON.stringify(await User.findAll({ attributes: globals.summaryProfileFields })));

                    const res = await agent.get('/users');
                    expect(res).to.have.status(200);
                    expect(res.body).to.deep.equal(userList);
                });
            });
        });

        describe('Sad paths', function () {
            // None
        });
    });

    describe('GET /users/:userId', function () {
        describe('Happy paths', function () {
            describe('Login and GET /users/:userId with valid userId', function () {
                it('should return status 200 and the publicProfile() coresponding to the userId', async function () {
                    const loginRes = await agent.post('/login').send(generateTestUserLoginCredentials('DT'));
                    expect(loginRes).to.redirectTo(globals.mochaTestingUrl + '/');
                    const user = await User.getUserByUsername(generateTestUser('DT').username);

                    const res = await agent.get('/users/' + user.id);
                    expect(res).to.have.status(200);
                    expect(JSON.parse(JSON.stringify(res.body))).to.deep.equal(JSON.parse(JSON.stringify(user.publicProfile())));
                });
            });

            describe('Logout and GET /users/:userId with valid userId', function () {
                it('should return status 200 and the publicProfile() coresponding to the userId', async function () {
                    const loRes = await agent.post('/logout');
                    expect(loRes).to.redirectTo(globals.mochaTestingUrl + '/');
                    const user = await User.getUserByUsername(generateTestUser('DT').username);

                    const res = await agent.get('/users/' + user.id);
                    expect(res).to.have.status(200);
                    expect(res.body).to.deep.equal(JSON.parse(JSON.stringify(user.publicProfile())));
                });
            });
        });

        describe('Sad paths', function () {
            describe('GET /users/:userId with invalid userId', function () {
                it('should return status 404 and an error message', async function () {
                    const users = await User.findAll();
                    users.sort((a, b) => b.id - a.id);
                    const badId = users[0].id + 1;

                    const res = await agent.get('/users/' + badId);
                    expect(res).to.have.status(404);
                    expect(res.body).to.deep.equal({ error: "There is no user with that userId." });
                });
            });

            describe('GET /users/:userId with bad userId format', function () {
                it('should return status 400 and an error message', async function () {
                    const res = await agent.get('/users/zero');
                    expect(res).to.have.status(400);
                    expect(res.body).to.deep.equal({ error: "That is not a properly formatted userId." })
                });
            });
        });
    });
});