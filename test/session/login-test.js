const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app');
const Mongo = require('../../src/database/mongo');
let mongo = Mongo.getInstance();
let client = request(app);
let {assertChanged} = require('../utils/test-utils');
let DataUtils = require('../utils/data-utils');

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


after(async () => {
    await mongo.close();
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
