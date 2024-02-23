const request = require('supertest');
const assert = require('assert');
const app = require('../app');
const { connectDB, init_DB } = require('../dbUtils');
const { response } = require('../app');

// Setup Express app before each test, reset database and register a user

let agent;

describe('Timeline', () => {
    before(async function () {
        agent = request.agent(app);
        init_DB();

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
        await agent.post('/add_message').send({text: 'Hello mom 👋'});
        await agent.post('/add_message').send({text: 'Hello dad 👋'});
        await agent.get('/logout');

        // repeat for mom
        await agent.post('/login').send({username: 'mom', password: 'default'});
        await agent.post('/add_message').send({text: 'Hi there'});
        await agent.get('/logout');

        // repeat for dad
        await agent.post('/login').send({username: 'dad', password: 'default'});
        await agent.post('/add_message').send({text: 'Message123'});
        await agent.get('/logout');
    });

    describe('Public', () => {
        it('should contain messages', async () => {
            const response = await agent
                .get('/public');

            const message1 = 'Hello mom 👋';
            const message2 = 'Hello dad 👋';
            const message3 = 'Hi there';
            const message4 = 'Message123';
            assert(response.text.includes(message1), 'Expected ' + message1 + ' not found in the response');
            assert(response.text.includes(message2), 'Expected ' + message2 + ' not found in the response');
            assert(response.text.includes(message3), 'Expected ' + message3 + ' not found in the response');
            assert(response.text.includes(message4), 'Expected ' + message4 + ' not found in the response');
        });

    });
});


/*

    def test_timelines(self):
        """Make sure that timelines work"""
        self.register_and_login('foo', 'default')
        self.add_message('the message by foo')
        self.logout()
        self.register_and_login('bar', 'default')
        self.add_message('the message by bar')
        rv = self.app.get('/public')
        assert 'the message by foo' in rv.data.decode('utf-8')
        assert 'the message by bar' in rv.data.decode('utf-8')

        # bar's timeline should just show bar's message
        rv = self.app.get('/')
        assert 'the message by foo' not in rv.data.decode('utf-8')
        assert 'the message by bar' in rv.data.decode('utf-8')

        # now let's follow foo
        rv = self.app.get('/foo/follow', follow_redirects=True)
        assert 'You are now following &#34;foo&#34;' in rv.data.decode('utf-8')

        # we should now see foo's message
        rv = self.app.get('/')
        assert 'the message by foo' in rv.data.decode('utf-8')
        assert 'the message by bar' in rv.data.decode('utf-8')

        # but on the user's page we only want the user's message
        rv = self.app.get('/bar')
        assert 'the message by foo' not in rv.data.decode('utf-8')
        assert 'the message by bar' in rv.data.decode('utf-8')
        rv = self.app.get('/foo')
        assert 'the message by foo' in rv.data.decode('utf-8')
        assert 'the message by bar' not in rv.data.decode('utf-8')

        # now unfollow and check if that worked
        rv = self.app.get('/foo/unfollow', follow_redirects=True)
        assert 'You are no longer following &#34;foo&#34;' in rv.data.decode('utf-8')
        rv = self.app.get('/')
        assert 'the message by foo' not in rv.data.decode('utf-8')
        assert 'the message by bar' in rv.data.decode('utf-8')
        */