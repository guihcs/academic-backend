const assert = require('assert');
const request = require('supertest');
const app = require('../app');
const Mongo = require('../src/database/mongo');
let mongo = Mongo.getInstance();

before(async () => {
    const uri = 'mongodb://localhost:27017';
    await mongo.connect(uri, 'test');
});

afterEach(async () => {
   await mongo.delete({});
});

after(() => {
    mongo.close();
});

describe('API Test', () => {

    it('Test user insertion', async () => {
        let user = {
            name: 'Lucas',
            cpf: '4123',
            login: 'qwe',
            password: 'asd'
        };
        let result = await request(app).post('/insertUser').send({user: user});

        assert.equal(result.body.status, 'ok');

        let find = await mongo.find('users', {cpf: '4123'});
        let resultUser = find[0];

        assert.equal(resultUser.name, user.name);
        assert.equal(resultUser.cpf, user.cpf);
        assert.equal(resultUser.login, user.login);
        assert.equal(resultUser.password, user.password);
    })
});
