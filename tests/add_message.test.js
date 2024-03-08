const request = require('supertest');
const assert = require('assert');
const app = require('../app');
const { connectDB, init_DB } = require('../utils/dbUtils');
const { response } = require('../app');

// Setup Express app before each test and reset database

let agent;

describe('Endpoint /add_message', () => {
    before(async function () {
        agent = request.agent(app);
        await init_DB();

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
    });

    it('should succesfully add a message', async () => {
        const response = await agent
            .post('/add_message')
            .send({
                text: 'Hello mom 👋'
            });
    });
});