const assert = require('chai').assert;
const request = require('supertest');
const app = require('../app');
let client = request(app);


describe("Lab", () => {
    it("Test", async () => {
       let result = await client.get('/r');
       console.log(result.body);


    });

    it("Test", async () => {

    });
})
