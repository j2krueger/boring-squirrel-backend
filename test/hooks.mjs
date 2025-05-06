"use strict";

import * as globalsModule from './globals.mjs';
import bcrypt from 'bcrypt';
import DB from '../models/index.js';

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

} = globalsModule;

export const mochaHooks = {
    async beforeAll() {
        console.time('Total testing time');
        await User.sync();

        // setup default test user 1
        const defaultTestUser = generateTestUser('DT');
        const registerRes = await agent.post('/register').send(defaultTestUser);
        const dbRes = await User.getUserByUsername(defaultTestUser.username);

        expect(registerRes).to.have.status(200);
        expect(dbRes).to.not.be.null;
        expect(dbRes.username).to.deep.equal(defaultTestUser.username);
        expect(dbRes.email).to.deep.equal(defaultTestUser.email);
        expect(await bcrypt.compare(defaultTestUser.password, dbRes.passwordHash)).to.be.true;

        // check default test user 1
        const loginRes = await agent.post('/login').send({ username: defaultTestUser.username, password: defaultTestUser.password });

        expect(loginRes).to.redirectTo(globals.mochaTestingUrl + '/');
    },

    async afterAll() {
        // delete everything setup at start of tests, and everything left over from previous testing
        // shut down database

        const dbDefaultTestUser = await User.getUserByUsername(generateTestUser('DT').username);
        await dbDefaultTestUser.destroy();

        await DB.sequelize.close();
        console.timeEnd('Total testing time');
    }
};

