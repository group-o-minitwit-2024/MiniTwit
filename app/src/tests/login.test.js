const request = require('supertest');
const assert = require('assert');
const app = require('../app');
const { connectDB, init_DB } = require('../utils/db');
const { response } = require('../app');

// Setup Express app before each test, reset database and register a user

let agent;

describe('Endpoint /login', () => {
    before(async function () {
        agent = request.agent(app);
        await init_DB();
        await agent
            .post('/register')
            .send({
                username: 'someUser',
                password: 'default',
                password2: 'default',
                email: 'someUser@email.com'
            });
    });

    it('should successfully login a registered user', async () => { 
        // attempt login that should be successful
        const response = await agent
            .post('/login')
            .send({
                username: 'someUser',
                password: 'default'
            });
        
            // ADD ASSERT
    });

    it('should fail due to wrong password', async () => {
        const response = await agent
            .post('/login')
            .send({
                username: 'someUser',
                password: 'notDefault'
            });
        
        errorMessage = 'Invalid password';
        assert(response.text.includes(errorMessage), 'Expected error message not found in the response');
    });

    it('should fail due to invalid username', async () => {
        const response = await agent
            .post('/login')
            .send({
                username: 'notAUser',
                password: 'Default'
            });

        const errorMessage = 'Invalid username';
        assert(response.text.includes(errorMessage), 'Expected error message not found in the response');
    });
});