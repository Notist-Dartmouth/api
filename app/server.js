import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import router from './router';
import authInit from './authentication';

var app = express();

// passport google oauth initialization
app.use(session({secret: 'semfd82asfvcx'}));
app.use(passport.initialize());
app.use(passport.session());
authInit(passport);
app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));
app.get('/auth/google/callback',
	passport.authenticate('google', { failureRedirect: '/login' }),
	function(req, res) {
	  res.redirect('/');
	});

// DB Setup
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/notist';
mongoose.connect(mongoURI);
// set mongoose promises to es6 default
mongoose.Promise = global.Promise;

// enable/disable cross origin resource sharing if necessary
app.use(cors());

// enable json message body for posting data to API
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// api routes
app.use('/', router);

// START THE SERVER
// =============================================================================
const port = process.env.PORT || 3000;
app.listen(port);

console.log(`listening on: ${port}`);
