const assert = require('chai').assert;
const request = require('supertest');
const app = require('../../app');
const Mongo = require('../../src/database/mongo');
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


after(async () => {
    await mongo.close();
});


const adminAuthToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsImlhdCI6MTUxNjIzOTAyMn0.k5cBO4UveFIW-OlT5BeD2YcgVxOByZM25S-ALbuHzi4';
const coordinatorAuthToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJjb29yZGluYXRvckB0ZXN0LmNvbSIsImlhdCI6MTUxNjIzOTAyMn0.YK2E28CVuX9kZafvBhLPCPIKR89HFIcxzC_Grb6pnQU';
const professorAuthToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJwcm9mZXNzb3JAdGVzdC5jb20iLCJpYXQiOjE1MTYyMzkwMjJ9.vy8yjr6kzu4xoMtYb9rAZdaUtWXpkgHQhuzEFgbLCOs';
const studentAuthToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJzdHVkZW50QHRlc3QuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.k43ToKDwHRogNlIvR4FQbq1tsXEgbYEjf2k6hunIe1o';

const correctAdminData = {
    type: 1,
    name: 'Test Admin User',
    cpf: '10987654321',
    email: 'admin@test.com',
    password: '123456password',
    profile: {
        phone: '987654321'
    },
    address: {
        cep: '987654321',
        city: 'TestCity',
        street: 'TestStreet',
        state: 'TestState'
    }
};


const correctCoordinatorData = {
    type: 1,
    name: 'Test Coordinator User',
    cpf: '12345678901',
    email: 'coordinator@test.com',
    password: 'password123456',
    profile: {
        phone: '123456789'
    },
    address: {
        cep: '123456789',
        city: 'TestCity',
        street: 'TestStreet',
        state: 'TestState'
    }
};

const correctProfessorData = {
    type: 1,
    name: 'Test Professor User',
    cpf: '10985768495',
    email: 'professor@test.com',
    password: 'password948657',
    profile: {
        phone: '18375964'
    },
    address: {
        cep: '123456789',
        city: 'TestCity',
        street: 'TestStreet',
        state: 'TestState'
    }
};

const correctStudentData = {
    type: 1,
    name: 'Test Student User',
    cpf: '91827465748',
    email: 'student@test.com',
    password: 'swordpass12456',
    profile: {
        phone: '3094682354'
    },
    address: {
        cep: '123456789',
        city: 'TestCity',
        street: 'TestStreet',
        state: 'TestState'
    }
};


function createCopy(obj){
    return JSON.parse(JSON.stringify(obj));
}

describe('Test sign', () => {
    describe('Test admin inserting coordinator', () => {
        it('Test correct case', async () => {
            mongo.save('users', correctAdminData);
            let coordinator = createCopy(correctCoordinatorData);
            let serverResponse = await client.post('/session').set({
                Authorization: 'Bearer ' + adminAuthToken
            }).send(coordinator);

        });

    });
});
