const assert = require('chai').assert;
const request = require('supertest');
const app = require('../app');
const Mongo = require('../src/database/mongo');
let mongo = Mongo.getInstance();
let client = request(app);

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

after(() => {
    mongo.close();
    mongod.stop();
});

async function setupUser() {
    let user = {
        name: 'Pedrol',
        cpf: '5124',
        email: 'qwe',
        password: 'asd'
    };

    await mongo.save('users', user);

    return user;
}


function assertChanged(oldObject, newObject, diff) {

    if (diff.change) {
        for (const key of Object.keys(diff.change)) {

            oldObject[key] = diff.change[key];
        }
    }

    if (diff.remove) {
        for (const key of diff.remove) {
            delete oldObject[key];
        }
    }

    assert.deepEqual(newObject, oldObject);
}


describe('Assert Changed test', () => {
    it('Object changed', () => {

        let a = {
            name: 'Pedrol',
            cpf: '5124',
            email: 'qwe',
            password: 'asd'
        };

        let b = {
            name: 'Pedrol',
            cpf: '5124',
            email: 'qwdase'
        };

        let diff = {
            change: {
                email: 'qwdase'
            },
            remove: ['password']
        };

        assertChanged(a, b, diff);
    });
});
