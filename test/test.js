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

describe('API Test', () => {

    describe('User Insertion', () => {
        it('Test user insertion', async () => {
            let user = await setupUser();
            let result = await client.post('/insertUser').send({user: user});

            assert.equal(result.body.status, 'ok');

            let find = await mongo.find('users', {cpf: user.cpf});
            let resultUser = find[0];

            assert.deepEqual(resultUser, user);
        });
    });


    describe('Login', () => {
        it('Test correct data', async () => {
            let user = await setupUser();

            let loginData = {
                email: user.email,
                password: user.password
            };

            let result = await client.post('/login').send(loginData);

            assert.equal(result.body.status, 'ok');
            let responseUser = result.body.session;
            delete user._id;
            delete responseUser._id;
            assert.deepEqual(responseUser, user);
        });

        it('Test blank data', async () => {
            let user = await setupUser();

            let loginData = {
                email: '',
                password: ''
            };

            let result = await client.post('/login').send(loginData);

            assert.equal(result.body.status, 'error');

        });

        it('Test wronk login', async () => {
            let user = await setupUser();

            let loginData = {
                email: 'asfasff',
                password: user.password
            };

            let result = await client.post('/login').send(loginData);

            assert.equal(result.body.status, 'error');
        });

        it('Test wrong password', async () => {
            let user = await setupUser();

            let loginData = {
                email: user.email,
                password: 'ascascasc'
            };

            let result = await client.post('/login').send(loginData);

            assert.equal(result.body.status, 'error');
        });
    });

    describe('User Deletion', () => {
        it('Test user deletion', async () => {
            let user = await setupUser();

            let result = await client.post('/deleteUser').send({
                key: 'cpf',
                value: user.cpf
            });

            assert.equal(result.body.status, 'ok');

            let find = await mongo.find('users', {});
            assert.lengthOf(find, 0);
        });

    });


    describe('User Update', () => {
        it('Test user update', async () => {
            let mockUser = await setupUser();
            let firstQuery = await mongo.find('users', {cpf: mockUser.cpf});
            assert.lengthOf(firstQuery, 1);
            let userId = firstQuery[0]._id;

            let user = {
                email: 'qwdase',
                password: 'acssd'
            };

            user._id = userId;
            let result = await client.post('/updateUser').send({user: user});

            assert.equal(result.body.status, 'ok');

            let find = await mongo.find('users', {});

            assert.lengthOf(find, 1);

            assertChanged(firstQuery[0], find[0], {
                change: {
                    email: user.email,
                    password: user.password
                }
            });
        });
    });


    describe('User Query', () => {
        it('Test user query', async () => {
            let users = [
                {
                    name: 'Cleitom',
                    type: 1
                },
                {
                    name: 'Jonas',
                    type: 1
                },
                {
                    name: 'Pedro',
                    type: 0
                },
                {
                    name: 'Antonio',
                    type: 2
                }
            ];

            await mongo.saveMany('users', users);
            let savedUsers = await mongo.find('users', {});
            assert.equal(savedUsers.length, users.length);
            let result = await client.get('/getUsers/0');

            assert.lengthOf(result.body, 1);

            result = await client.get('/getUsers/1');

            assert.lengthOf(result.body, 2);

            result = await client.get('/getUsers/2');

            assert.lengthOf(result.body, 1);

        });
    });

});
