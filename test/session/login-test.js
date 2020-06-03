const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app');
const Mongo = require('../../src/database/mongo');
let mongo = Mongo.getInstance();
let client = request(app);
let {assertChanged} = require('../utils/test-utils');
let DataUtils = require('../utils/data-utils');

const {MongoMemoryServer} = require('mongodb-memory-server');

let mongod;

before(async () => {

    mongod = new MongoMemoryServer();

    const uri = await mongod.getUri();
    const port = await mongod.getPort();
    const dbPath = await mongod.getDbPath();
    const dbName = await mongod.getDbName();

    await mongo.connect(uri, dbName);
});
beforeEach(async () => {
    await mongo.delete('users', {});
});

afterEach(async () => {
    await mongo.delete('users', {});
});


after(async () => {
    await mongo.close();
    await mongod.stop();
});


describe('Test login', () => {

    it('Test correct data', async () => {
        let coordinator = DataUtils.correctCoordinatorData;
        await mongo.save('users', coordinator);

        let result = await client.post('/login').send({
            email: coordinator.email,
            password: coordinator.password
        })



    });

});
