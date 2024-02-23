const request = require('supertest');
const assert = require('assert');
const app = require('../app');
const { connectDB, init_DB } = require('../dbUtils');
const { response } = require('../app');

// Setup Express app before each test and reset database

let agent;

describe('Endpoint /add_message', () => {
    before(function () {
        agent = request.agent(app);
        init_DB();
    })
    it('should succesfully add a message', async () => {
        const register_response = await agent
            .post('/register')
            .send({
                username: 'test',
                password: 'test',
                password2: 'test',
                email: 'test@test.test'
            });

        const login_response = await agent
            .post('/login')
            .send({
                username: 'test',
                password: 'test'
            });

        const response = await agent
            .post('/add_message')
            .send({
                text: 'Hello mom 👋'
            });
    });
});