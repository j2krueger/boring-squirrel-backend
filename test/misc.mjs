"use strict";

import { Newsletter, IndependentGame } from '../models/combined.js';
import * as testGlobals from './globals.mjs';

const {
    // resources
    expect,
    agent,
    // globals
    // globals,
    testString,
    // testUsername,
    // testEmail,
    // testPassword,
    // models
    // User,
    // functions
    generateTestUser,
} = testGlobals;

describe('Test the miscellaneous routes', function () {
    describe('POST /newsletter route', function () {
        describe('Happy paths', function () {
            describe('Post /newsletter with "address" containing a string', function () {
                it('should return a 200 status and the new database entry and add the string to the database', async function () {
                    const testUser = generateTestUser("NL");

                    const res = await agent.post('/newsletter').send({ address: testUser.email });

                    expect(res).to.have.status(200);
                    expect(res.body.address).to.deep.equal(testUser.email);
                    const createdEmail = await Newsletter.getNewsletter(res.body.id);
                    expect(createdEmail.address).to.deep.equal(testUser.email);

                    await createdEmail.destroy();
                });
            });
        });

        describe('Sad paths', function () {
            describe('Post /newsletter with "address" containing a non-string', function () {
                it('should return a 400 status and an error message', async function () {
                    const res = await agent.post('/newsletter').send({ address: { nonstring: null } });

                    expect(res).to.have.status(400);
                    expect(res.body).to.deep.equal({ error: "Address must be a string." });
                });
            });

            describe('Post /newsletter without an "address" in the request body', function () {
                it('should return a 400 status and an error message', async function () {
                    const res = await agent.post('/newsletter').send({ noAddress: { nonstring: null } });

                    expect(res).to.have.status(400);
                    expect(res.body).to.deep.equal({ error: "Address must be a string." });
                });
            });

            describe('Post /newsletter with a duplicate "address" in the request boddy', function () {
                it('should return a 409 status and an error message', async function () {
                    const testUser = generateTestUser("NL");

                    const res = await agent.post('/newsletter').send({ address: testUser.email });
                    const createdEmail = await Newsletter.getNewsletter(res.body.id);
                    expect(res).to.have.status(200);
                    const dupRes = await agent.post('/newsletter').send({ address: testUser.email });

                    expect(dupRes).to.have.status(409);
                    expect(dupRes.body).to.deep.equal({ error: "Address is already in database." });

                    await createdEmail.destroy();
                });
            });
        });
    });

    describe('POST /independentgame route', function () {
        describe('Happy paths', function () {
            describe('Logout and POST form', function () {
                it('should return status 200 and add the data to the database', async function () {
                    const bodyJson = {
                        gameName: testString,
                        description: "test description",
                        imageUrl: "https://www.example.com/image1.jpg",
                        tag1: "test",
                        tag2: "tag2",
                        tag3: "tag3",
                        category: "test category",
                        linkUrl: "https://www.example.com/",
                        email: "email@example.com",
                        additionalInfo: "additional test info"
                    };

                    const res = await agent.post('/independentgame').send(bodyJson);

                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.include(bodyJson);
                    expect(res.body).to.have.property('id');
                    const independentGame = await IndependentGame.findByPk(res.body.id);
                    expect(independentGame).to.include(bodyJson);

                    independentGame.destroy();
                });
            });
        });

        describe('Sad paths', function () {
            let testGame;

            before('Set up IndependentGame entry for duplication testing', async function () {
                const bodyJson = {
                    gameName: testString,
                    description: "test description",
                    imageUrl: "https://www.example.com/image1.jpg",
                    tag1: "test",
                    tag2: "tag2",
                    tag3: "tag3",
                    category: "test category",
                    linkUrl: "https://www.example.com/",
                    email: "email@example.com",
                    additionalInfo: "additional test info"
                };
                const testRes = await agent.post('/independentgame').send(bodyJson);
                expect(testRes).to.have.status(200);
                expect(testRes.body).to.be.an('object');
                expect(testRes.body).to.include(bodyJson);
                expect(testRes.body).to.have.property('id');
                testGame = await IndependentGame.findByPk(testRes.body.id);
            });

            after('Tear down IndependentGame entry for duplication testing', async function () {
                await testGame.destroy()
            });

            describe('POST form with duplicate of existing game name', function () {
                it('should return status 409 and an appropriate error message', async function () {
                    const bodyJson = {
                        gameName: testString,
                        description: "test description 2",
                        imageUrl: "https://www.example.com/image.jpg",
                        tag1: "test",
                        tag2: "tag2",
                        tag3: "tag3",
                        category: "test category",
                        linkUrl: "https://www.example.com/2",
                        email: "email@example.com",
                        additionalInfo: "additional test info"
                    };

                    const res = await agent.post('/independentgame').send(bodyJson);

                    expect(res).to.have.status(409);
                    expect(res.body).to.deep.equal({ "error": "gameName must be unique" });
                });
            });

            describe('POST form with duplicate of existing link URL', function () {
                it('should return status 409 and an appropriate error message', async function () {
                    const bodyJson = {
                        gameName: testString + "2",
                        description: "test description 2",
                        imageUrl: "https://www.example.com/image.jpg",
                        tag1: "test",
                        tag2: "tag2",
                        tag3: "tag3",
                        category: "test category",
                        linkUrl: "https://www.example.com/",
                        email: "email@example.com",
                        additionalInfo: "additional test info"
                    };

                    const res = await agent.post('/independentgame').send(bodyJson);

                    expect(res).to.have.status(409);
                    expect(res.body).to.deep.equal({ "error": "linkUrl must be unique" });
                });
            });

            describe('POST form with missing gameName', function () {
                it('should return status 400 and an appropriate error message', async function () {
                    const bodyJson = {
                        // gameName: testString + 2,
                        description: "test description 2",
                        imageUrl: "https://www.example.com/image.jpg",
                        tag1: "test",
                        tag2: "tag2",
                        tag3: "tag3",
                        category: "test category",
                        linkUrl: "https://www.example.com/2",
                        email: "email@example.com",
                        additionalInfo: "additional test info"
                    };

                    const res = await agent.post('/independentgame').send(bodyJson);

                    expect(res).to.have.status(400);
                    expect(res.body).to.deep.equal({ "error": "IndependentGame.gameName cannot be null" });
                });
            });

            describe('POST form with gameName of wrong format', function () {
                it('should return status 400 and an appropriate error message', async function () {
                    const bodyJson = {
                        gameName: [],
                        description: "test description 2",
                        imageUrl: "https://www.example.com/image.jpg",
                        tag1: "test",
                        tag2: "tag2",
                        tag3: "tag3",
                        category: "test category",
                        linkUrl: "https://www.example.com/2",
                        email: "email@example.com",
                        additionalInfo: "additional test info"
                    };

                    const res = await agent.post('/independentgame').send(bodyJson);

                    expect(res).to.have.status(400);
                    expect(res.body).to.deep.equal({ "error": "gameName cannot be an array or an object" });
                });

            });

            describe('POST form with missing description', function () {
                it('should return status 400 and an appropriate error message', async function () {
                    const bodyJson = {
                        gameName: testString + 2,
                        // description: "test description 2",
                        imageUrl: "https://www.example.com/image.jpg",
                        tag1: "test",
                        tag2: "tag2",
                        tag3: "tag3",
                        category: "test category",
                        linkUrl: "https://www.example.com/2",
                        email: "email@example.com",
                        additionalInfo: "additional test info"
                    };

                    const res = await agent.post('/independentgame').send(bodyJson);

                    expect(res).to.have.status(400);
                    expect(res.body).to.deep.equal({ "error": "IndependentGame.description cannot be null" });
                });
            });

            describe('POST form with missing imageUrl', function () {
                it('should return status 400 and an appropriate error message', async function () {
                    const bodyJson = {
                        gameName: testString + 2,
                        description: "test description 2",
                        // imageUrl: "https://www.example.com/image.jpg",
                        tag1: "test",
                        tag2: "tag2",
                        tag3: "tag3",
                        category: "test category",
                        linkUrl: "https://www.example.com/2",
                        email: "email@example.com",
                        additionalInfo: "additional test info"
                    };

                    const res = await agent.post('/independentgame').send(bodyJson);

                    expect(res).to.have.status(400);
                    expect(res.body).to.deep.equal({ "error": "IndependentGame.imageUrl cannot be null" });
                });
            });

            describe('POST form with missing category', function () {
                it('should return status 400 and an appropriate error message', async function () {
                    const bodyJson = {
                        gameName: testString + 2,
                        description: "test description 2",
                        imageUrl: "https://www.example.com/image.jpg",
                        tag1: "test",
                        tag2: "tag2",
                        tag3: "tag3",
                        // category: "test category",
                        linkUrl: "https://www.example.com/2",
                        email: "email@example.com",
                        additionalInfo: "additional test info"
                    };

                    const res = await agent.post('/independentgame').send(bodyJson);

                    expect(res).to.have.status(400);
                    expect(res.body).to.deep.equal({ "error": "IndependentGame.category cannot be null" });
                });
            });

            describe('POST form with missing linkUrl', function () {
                it('should return status 400 and an appropriate error message', async function () {
                    const bodyJson = {
                        gameName: testString + 2,
                        description: "test description 2",
                        imageUrl: "https://www.example.com/image.jpg",
                        tag1: "test",
                        tag2: "tag2",
                        tag3: "tag3",
                        category: "test category",
                        // linkUrl: "https://www.example.com/2",
                        email: "email@example.com",
                        additionalInfo: "additional test info"
                    };

                    const res = await agent.post('/independentgame').send(bodyJson);

                    expect(res).to.have.status(400);
                    expect(res.body).to.deep.equal({ "error": "IndependentGame.linkUrl cannot be null" });
                });
            });

            describe('POST form with missing email', function () {
                it('should return status 400 and an appropriate error message', async function () {
                    const bodyJson = {
                        gameName: testString + 2,
                        description: "test description 2",
                        imageUrl: "https://www.example.com/image.jpg",
                        tag1: "test",
                        tag2: "tag2",
                        tag3: "tag3",
                        category: "test category",
                        linkUrl: "https://www.example.com/2",
                        // email: "email@example.com",
                        additionalInfo: "additional test info"
                    };

                    const res = await agent.post('/independentgame').send(bodyJson);

                    expect(res).to.have.status(400);
                    expect(res.body).to.deep.equal({ "error": "IndependentGame.email cannot be null" });
                });
            });

            describe('POST form with verified: true', function () {
                it('should return status 400 and an error message, and NOT add the data to the database', async function () {
                    const bodyJson = {
                        gameName: testString + 2,
                        description: "test description 2",
                        imageUrl: "https://www.example.com/image.jpg",
                        tag1: "test",
                        tag2: "tag2",
                        tag3: "tag3",
                        category: "test category",
                        linkUrl: "https://www.example.com/2",
                        email: "email@example.com",
                        additionalInfo: "additional test info",
                        verified: true,
                    };

                    const res = await agent.post('/independentgame').send(bodyJson);

                    expect(res).to.have.status(400);
                    expect(res.body).to.deep.equal({ "error": "Lolnope." });
                    const independentGame = await IndependentGame.findAll({ where: { gameName: bodyJson.gameName } });
                    expect(independentGame.length).to.equal(0);
                });
            });
        });
    });
});