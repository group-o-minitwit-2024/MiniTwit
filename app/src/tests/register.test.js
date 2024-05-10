const request = require('supertest');
const assert = require('assert');
const app = require('../app');
const { init_DB } = require('../utils/db');
const { response } = require('../app');



let agent;


describe('Endpoint /register', () => {
    beforeEach(async function () {
        // Setup Express app before each test and reset database
        agent = request.agent(app);
        await init_DB();
    });
    
    it('should register a user', async () => {
        const response = await agent
            .post('/register')
            .send({
                username: 'user1',
                password: 'default',
                password2: 'default',
                email: 'user1@example.com'
            })
            .redirects(1);
        
        assert(response.text.includes("You were successfully registered and can login now"), "Expected success message not found in the response")
        // add assert
    });

    it('should fail due to duplicate username', async () => {
        await agent
            .post('/register')
            .send({
                username: 'someUser',
                password: 'default',
                password2: 'default',
                email: 'someUser@email.com'
            });

        const response2 = await agent
            .post('/register')
            .send({
                username: 'someUser',
                password: 'default',
                password2: 'default',
                email: 'someUser@email.com'
            });

        const errorMessage = 'The username is already taken';
        assert(response2.text.includes(errorMessage), 'Expected error message not found in the response');
    });

    it('should fail to register with no data', async () => {
        const response = await agent
            .post('/register')
            .send({});
        
        const errorMessage = 'All fields are required';
        assert(response.text.includes(errorMessage), 'Expected error message not found in the response');
    });

    it('should fail due to password mismatch', async () => {
        const response = await agent
            .post('/register')
            .send({
                username: 'user1',
                password: 'something',
                password2: 'somethingElse',
                email: 'user1@example.com'
            });
        
        const errorMessage = 'The two passwords do not match';
        assert(response.text.includes(errorMessage), 'Expected error message not found in the response');
    });

    it('should fail due to invalid email format', async () => {
        const response = await agent
            .post('/register')
            .send({
                username: 'user1',
                password: 'default',
                password2: 'default',
                email: 'invalidEmail'
            });

        const errorMessage = 'You have to enter a valid email address';
        assert(response.text.includes(errorMessage), 'Expected error message not found in the response');
    });
});