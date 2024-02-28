const request = require('supertest');
const assert = require('assert');
const app = require('../app');
const { connectDB, init_DB } = require('../dbUtils');
const { response } = require('../app');

// Setup Express app before each test, reset database and register a user

let agent;

describe('Endpoint /login', () => {
    before(function () {
        agent = request.agent(app);
        init_DB();
    });

    it('should successfully login a registered user', async () => { 
        const register_response = await agent
        .post('/register')
        .send({
            username: 'someUser',
            password: 'default',
            password2: 'default',
            email: 'someUser@email.com'
        });
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
        const register_response = await agent
        .post('/register')
        .send({
            username: 'someUser',
            password: 'default',
            password2: 'default',
            email: 'someUser@email.com'
        });

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