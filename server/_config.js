const config = {};

config.mongoURI = {
  development: 'mongodb://localhost/notist',
  test: 'mongodb://localhost/notist-test',
  production: process.env.MONGODB_URI,
};

module.exports = config;
