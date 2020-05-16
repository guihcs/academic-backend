const assert = require('chai').assert;
const request = require('supertest');
const app = require('../app');
const Mongo = require('../src/database/mongo');
let mongo = Mongo.getInstance();
let client = request(app);

before(async () => {
    const uri = 'mongodb://localhost:27017';
    await mongo.connect(uri, 'test');
});

beforeEach(async () => {
    await mongo.delete('users', {});
});

afterEach(async () => {
    await mongo.delete('users', {});
});

after(() => {
    mongo.close();
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
