const http = require('http');
const assert = require('assert');
const fs = require('fs');
const { init_DB, connect_DB, query, execute } = require('../dbUtils'); 

// Define constants for authentication
const BASE_URL = 'http://localhost:5001';
const USERNAME = 'simulator';
const PWD = 'super_safe!';
const CREDENTIALS = `${USERNAME}:${PWD}`;
const ENCODED_CREDENTIALS = Buffer.from(CREDENTIALS).toString('base64');
const HEADERS = {   
    'Connection': 'close',
    'Content-Type': 'application/json',
    'Authorization': `Basic ${ENCODED_CREDENTIALS}`
};

// Define a function to simulate a delay (used in testing)
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to make HTTP requests (from chatgpt)
function makeRequest(method, path, data, params) {
    return new Promise((resolve, reject) => {
        // Options for the HTTP request
        const options = {
            hostname: 'localhost',
            port: 5001,
            path: path + (params ? `?${new URLSearchParams(params)}` : ''),
            method,
            headers: HEADERS
        };

        // Create an HTTP request
        const req = http.request(options, (res) => {
            let responseData = '';

            // Accumulate response data as it arrives
            res.on('data', (chunk) => {
                responseData += chunk;
            });

            // Resolve the promise when the response is complete
            res.on('end', () => {
                resolve({ status: res.statusCode, data: responseData });
            });
        });

        // Handle errors with the HTTP request
        req.on('error', (error) => {
            reject(error);
        });

        // Write request data if provided
        if (data) {
            req.write(JSON.stringify(data));
        }

        // End the request
        req.end();
    });
}

// Update the latest command ID
async function updateLatest(commandId) {
    await makeRequest('GET', '/latest', null, { latest: commandId });
}

// Test function for the 'latest' endpoint
async function testLatest() {
    const data = { username: 'test', email: 'test@test', pwd: 'foo' };
    const params = { latest: 1337 };

    // Make a request to register a user
    const response = await makeRequest('POST', '/register', data, params);
    assert(response.status === 204);

    // Update the latest command ID
    await updateLatest(1337);

    // Make a request to get the latest command ID
    const latestResponse = await makeRequest('GET', '/latest');
    assert(latestResponse.status === 200);
    assert(JSON.parse(latestResponse.data).latest === 1337);
}

// Test function for the 'register' endpoint
async function testRegister() {
    const username = 'a';
    const email = 'a@a.a';
    const pwd = 'a';
    const data = { username, email, pwd };
    const params = { latest: 1 };

    // Make a request to register a user
    const response = await makeRequest('POST', '/register', data, params);
    assert(response.status === 204);

    // TODO: add another assertion that the user is really registered

    // Update the latest command ID
    await updateLatest(1);

    // Make a request to get the latest command ID
    const latestResponse = await makeRequest('GET', '/latest');
    assert(latestResponse.status === 200);
    assert(JSON.parse(latestResponse.data).latest === 1);
}

// TODO: Test function for other endpoints 

// Run all tests
async function runTests() {
    // // Initialize the database (if needed)
    // await initDb();

    // Run individual test functions
    await testLatest();
    await testRegister();
    // Add other test calls here
}

// Execute tests and log success or failure
runTests().then(() => console.log('All tests passed!')).catch(err => console.error(err));
