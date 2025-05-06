"use strict";

import Newsletter from '../models/newsletter.js';
import * as testGlobals from './globals.mjs';

const {
    // resources
    expect,
    agent,
    // globals
    // globals,
    // testString,
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
});