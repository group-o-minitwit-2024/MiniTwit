const request = require('supertest');
const assert = require('assert');
const app = require('../app');
const { connectDB, init_DB } = require('../dbUtils');
const { response } = require('../app');

// Setup Express app before each test, reset database and register a user

let agent;

describe('Timeline', () => {
    // messages to post on various accounts
    const message1 = 'Hello mom 👋';
    const message2 = 'Hello dad 👋';
    const message3 = 'Hi there';
    const message4 = 'Message123';

    before(async function () {
        agent = request.agent(app);
        await init_DB();

        // register dummy accounts
        await agent.post('/register').send({
            username: 'Jeff',
            password: 'default',
            password2: 'default',
            email: 'jeff@email.com'
        });
        await agent.post('/register').send({
            username: 'mom',
            password: 'default',
            password2: 'default',
            email: 'mom@email.com'
        });
        await agent.post('/register').send({
            username: 'dad',
            password: 'default',
            password2: 'default',
            email: 'dad@email.com'
        });

        // login to Jeff, post messages, and logout
        await agent.post('/login').send({username: 'Jeff', password: 'default'});
        await agent.post('/add_message').send({text: message1});
        await agent.post('/add_message').send({text: message2});
        await agent.get('/logout');

        // repeat for mom
        await agent.post('/login').send({username: 'mom', password: 'default'});
        await agent.post('/add_message').send({text: message3});
        await agent.get('/logout');

        // repeat for dad
        await agent.post('/login').send({username: 'dad', password: 'default'});
        await agent.post('/add_message').send({text: message4});
        await agent.get('/logout');
    });

    it('should contain messages', async () => {
        const response = await agent
            .get('/public');

        assert(response.text.includes(message1), 'Expected \'' + message1 + '\' not found in the response');
        assert(response.text.includes(message2), 'Expected \'' + message2 + '\' not found in the response');
        assert(response.text.includes(message3), 'Expected \'' + message3 + '\' not found in the response');
        assert(response.text.includes(message4), 'Expected \'' + message4 + '\' not found in the response');
    });

    it('should only contain Jeff\'s message on Jeff\'s timeline', async () => {
        const response = await agent
            .get('/Jeff');
        
        assert(response.text.includes(message1), 'Expected \'' + message1 + '\' not found in the response');
        assert(response.text.includes(message2), 'Expected \'' + message2 + '\' not found in the response');
        assert(!response.text.includes(message3), 'Expected \'' + message3 + '\' not found in the response');
        assert(!response.text.includes(message4), 'Expected \'' + message4 + '\' not found in the response');
    });

    it('should only contain Jeff message on Jeff\'s timeline', async () => {
        const response = await agent
            .get('/Jeff');
        
        assert(response.text.includes(message1), 'Expected \'' + message1 + '\' not found in the response');
        assert(response.text.includes(message2), 'Expected \'' + message2 + '\' not found in the response');
        assert(!response.text.includes(message3), 'Expected \'' + message3 + '\' not found in the response');
        assert(!response.text.includes(message4), 'Expected \'' + message4 + '\' not found in the response');
    });

    it('should display mom\'s messages on Jeff\'s timeline when followed', async () => {
        await agent.post('/login').send({username: 'Jeff', password: 'default'});
        const follow = await agent.get('/mom/follow');
        const followRedirect = await agent.get(follow.headers.location); // get redirected request
        const followMessage = 'You are now following &#34;mom&#34;';
        assert(followRedirect.text.includes(followMessage), 'Expected \'' + followMessage + '\' not found in the response');

        const response = await agent.get('/');
        assert(response.text.includes(message1), 'Expected \'' + message1 + '\' not found in the response');
        assert(response.text.includes(message2), 'Expected \'' + message2 + '\' not found in the response');
        assert(response.text.includes(message3), 'Expected \'' + message3 + '\' not found in the response');
        assert(!response.text.includes(message4), 'Expected \'' + message4 + '\' not found in the response');
    });
});