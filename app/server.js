import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import router from './router';
import authInit from './authentication';

const MongoStore = require('connect-mongo')(session);
const app = express();

// load environment variables
require('dotenv').load();

// DB Setup
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI);
// set mongoose promises to es6 default
mongoose.Promise = global.Promise;

// passport google oauth initialization
app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false, // don't create session until something stored
  resave: false, // don't save session if unmodified
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    touchAfter: 24 * 3600, // time period in seconds to forced session resave
  }),
}));
app.use(passport.initialize());
app.use(passport.session());
authInit(passport);
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/login/facebook', passport.authenticate('facebook', { scope: ['email'] }));
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' }));

// enable/disable cross origin resource sharing if necessary
app.use(cors());

// enable json message body for posting data to API
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// api routes
app.use('/', router);

// START THE SERVER
// =============================================================================
const port = process.env.PORT;
app.listen(port);

console.log(`listening on: ${port}`);
