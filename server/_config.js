import express from 'express';
import mongoose from 'mongoose';

const app = express();

const config = {};

config.mongoURI = {
  development: 'mongodb://localhost/notist',
  test: 'mongodb://localhost/notist-test',
};

// DB Setup
// *** mongoose *** ///
mongoose.connect(config.mongoURI[app.settings.env], (err, res) => {
  if (err) {
    console.log(`Error connecting to the database: ${err}`);
  } else {
    console.log(`Connected to Database: ${config.mongoURI[app.settings.env]}`);
  }
});

// set mongoose promises to es6 default
mongoose.Promise = global.Promise;

export { app, mongoose };
