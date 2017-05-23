const config = {};

config.mongoURI = {
  development: 'mongodb://localhost/notist',
  test: 'mongodb://localhost/notist-test',
  production: process.env.MONGODB_URI,
};

config.frontEndHost = process.env.NODE_ENV === 'production' ? 'https://notist.io' : 'http://localhost:5000';

module.exports = config;
