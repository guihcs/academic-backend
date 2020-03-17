const assert = require('assert');
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
        login: 'qwe',
        password: 'asd'
    };

    await mongo.save('users', user);

    return user;
}

describe('API Test', () => {

    describe('User Insertion', () => {
        it('Test user insertion', async () => {
            let user = await setupUser();
            let result = await client.post('/insertUser').send({user: user});

            assert.equal(result.body.status, 'ok');

            let find = await mongo.find('users', {cpf: user.cpf});
            let resultUser = find[0];

            assert.equal(resultUser.name, user.name);
            assert.equal(resultUser.cpf, user.cpf);
            assert.equal(resultUser.login, user.login);
            assert.equal(resultUser.password, user.password);
        });
    });


    describe('Login', () => {
        it('Test user login', async () => {
            let user = await setupUser();

            let loginData = {
                login: 'qwe',
                password: 'asd'
            };

            let result = await client.post('/login').send(loginData);

            assert.equal(result.body.status, 'ok');
            let responseUser = result.body.session;

            assert.equal(responseUser.name, user.name);
            assert.equal(responseUser.cpf, user.cpf);
            assert.equal(responseUser.login, user.login);
            assert.equal(responseUser.password, user.password);


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
            assert.equal(find.length, 0);
        });

    });


    describe('User Update', () => {
        it('Test user update', async () => {
            let mockUser = await setupUser();
            let firstQuery = await mongo.find('users', {cpf: mockUser.cpf});
            let userId = firstQuery[0]._id;

            let user = {
                name: 'Tiam',
                cpf: '5124',
                login: 'qwe',
                password: 'asd'
            };

            user._id = userId;

            let result = await client.post('/updateUser').send({user: user});

            assert.equal(result.body.status, 'ok');

            let find = await mongo.find('users', {});

            assert.equal(find.length, 1);

            assert.equal(find[0].name, user.name);
            assert.equal(find[0].cpf, user.cpf);
            assert.equal(find[0].login, user.login);
            assert.equal(find[0].password, user.password);

        });
    });


    describe('User Query', () => {
        it('Test user query', async () => {
            let users = [
                {
                    name: 'Cleitom',
                    type: '1'
                },
                {
                    name: 'Jonas',
                    type: '1'
                },
                {
                    name: 'Pedro',
                    type: '0'
                },
                {
                    name: 'Antonio',
                    type: '2'
                }
            ];

            await mongo.saveMany('users', users);
            let result = await client.get('/getUsers/0');

            assert.equal(result.body.length, 1);

            result = await client.get('/getUsers/1');

            assert.equal(result.body.length, 2);

            result = await client.get('/getUsers/2');

            assert.equal(result.body.length, 1);

        });
    });

});
