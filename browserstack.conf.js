const parallelConfig = {
    user: 'laugekj_FQZGuf',
    key: 'RrDDHgdohrmyfBCcnQsS',
    hostname: 'hub.browserstack.com',
    capabilities: [
      {
        browserName: 'Chrome',
        'bstack:options': {
          os: 'Windows',
          osVersion: '10',
          browserVersion: '120.0'
        }
      },
      {
        browserName: 'Safari',
        'bstack:options': {
          os: 'OS X',
          osVersion: 'Monterey',
          browserVersion: '15.6'
        }
      },
      {
        browserName: 'Firefox',
        'bstack:options': {
          os: 'Windows',
          osVersion: '11',
          browserVersion: 'latest'
        }
      }
    ],
    commonCapabilities: {
      'bstack:options': {
        buildName: 'browserstack-build-1'
      }
    },
    maxInstances: 10
  };
  const { config: baseConfig } = require('./base.conf.js');
  
  exports.config = { ...baseConfig, ...parallelConfig };
  // Code to support common capabilities
  exports.config.capabilities.forEach(function(caps) {
    for (var i in exports.config.commonCapabilities)
      caps[i] = { ...caps[i], ...exports.config.commonCapabilities[i] };
  });