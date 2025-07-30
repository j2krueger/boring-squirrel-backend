"use strict";

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
    // IndependentGame,
    // functions
    // generateTestUser,
    // generateTestUserLoginCredentials,
} = testGlobals;

describe('Test game related routes', function () {
    describe('Get /game', function () {
        it('should return status 200 and a list of available games', async function () {
            const res = await agent.get('/game');
            
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            for (const element of res.body) {
                expect(element).to.have.property('id');
                expect(element).to.have.property('name');
                expect(element).to.have.property('description');
                expect(element).to.have.property('rules');
            }
        });
    });

    describe('Test /game/:gameId routes for each game', function () {
        describe('Test /game/:gameId routes for Acorn Sweeper', function () {
            let gameId;

            before('Setup gameId for Acorn Sweeper', async function () {
                const res = await agent.get('/game');
                const acornSweeper = res.body.find(x=>x.name == 'Acorn Sweeper');
                expect(acornSweeper).to.exist;
                gameId = acornSweeper.id;
            });

            describe('POST /game/:gameId/stats', function () {
                
            });
        });
    });
});