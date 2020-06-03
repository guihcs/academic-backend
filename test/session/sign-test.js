const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app');
const Mongo = require('../../src/database/mongo');
const {adminAuthToken} = require("../utils/data-utils");
const {correctCoordinatorData} = require("../utils/data-utils");
const {correctAdminData} = require("../utils/data-utils");
let mongo = Mongo.getInstance();
let client = request(app);
let {assertChanged} = require('../utils/test-utils');
const server = require('../../bin/www');
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
    server.close();
});



function createCopy(obj){
    return JSON.parse(JSON.stringify(obj));
}

describe('Test sign', () => {
    describe('Test admin inserting coordinator', () => {
        it('Test correct data', async () => {
            mongo.save('users', correctAdminData);
            let coordinator = createCopy(correctCoordinatorData);
            let serverResponse = await client
                .post('/addUser')
                .send(coordinator)
                .set({Authorization: 'Bearer ' + adminAuthToken})
                .expect(200);

            let savedUser = (await mongo.find('users', {email: coordinator.email}))[0];

            assertChanged(savedUser, coordinator, {
                change: {
                    password: savedUser.password,
                    _id: savedUser._id
                }
            })

        });
        it('Test empty data', async () => {
            mongo.save('users', correctAdminData);
            let coordinator = {};
            let serverResponse = await client
                .post('/addUser')
                .send(coordinator)
                .set({Authorization: 'Bearer ' + adminAuthToken})
                .expect(400);

            let savedUser = await mongo.find('users', {});

            assert.lengthOf(savedUser, 1);

            assert.deepEqual(savedUser[0], correctAdminData);

        });

        it('Test invalid email', async () => {
            mongo.save('users', correctAdminData);
            let coordinator = createCopy(correctCoordinatorData);
            coordinator.email = 'd10928h91cu2';
            let serverResponse = await client
                .post('/addUser')
                .send(coordinator)
                .set({Authorization: 'Bearer ' + adminAuthToken})
                .expect(400);

            let savedUser = await mongo.find('users', {});

            assert.lengthOf(savedUser, 1);

            assert.deepEqual(savedUser[0], correctAdminData);

        });

        it('Test invalid password', async () => {
            mongo.save('users', correctAdminData);
            let coordinator = createCopy(correctCoordinatorData);
            coordinator.password = '[ac';
            let serverResponse = await client
                .post('/addUser')
                .send(coordinator)
                .set({Authorization: 'Bearer ' + adminAuthToken})
                .expect(400);

            let savedUser = await mongo.find('users', {});

            assert.lengthOf(savedUser, 1);

            assert.deepEqual(savedUser[0], correctAdminData);

        });

        it('Test invalid cpf', async () => {
            mongo.save('users', correctAdminData);
            let coordinator = createCopy(correctCoordinatorData);
            coordinator.cpf = '8jd98n128';
            let serverResponse = await client
                .post('/addUser')
                .send(coordinator)
                .set({Authorization: 'Bearer ' + adminAuthToken})
                .expect(400);

            let savedUser = await mongo.find('users', {});
            assert.lengthOf(savedUser, 1);
            assert.deepEqual(savedUser[0], correctAdminData);
        });

        it('Test coordinator already registered cpf', async () => {
            mongo.save('users', correctAdminData);
            let coordinator = createCopy(correctCoordinatorData);
            await client
                .post('/addUser')
                .send(coordinator)
                .set({Authorization: 'Bearer ' + adminAuthToken})
                .expect(200);

            await client
                .post('/addUser')
                .send(coordinator)
                .set({Authorization: 'Bearer ' + adminAuthToken})
                .expect(400);

            let savedUser = await mongo.find('users', {});
            assert.lengthOf(savedUser, 2);
        });

    });

});
