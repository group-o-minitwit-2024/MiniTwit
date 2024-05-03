exports.config = {
    user: process.env.BROWSERSTACK_USERNAME,
    key: process.env.BROWSERSTACK_ACCESS_KEY,
  
    updateJob: false,
    specs: ['../test/specs/test.e2e.js'],
    exclude: [],
  
    logLevel: 'info',
    coloredLogs: true,
    screenshotPath: './errorShots/',
    baseUrl: 'http://178.62.218.96:5000',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    hostname: 'hub.browserstack.com',
    services: [['browserstack']],
  
    before: function () {
      var chai = require('chai');
      global.expect = chai.expect;
      chai.Should();
    },
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
      ui: 'bdd',
      timeout: 60000,
    },
  };
  