import User from './models/user';
import OAuth2Strategy from 'passport-google-oauth2';
import Strategy from 'passport-facebook';

var googleCallback = function(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
    User.findOne(
      { googleId: profile.id },
      function (err, user) {
	if (!user) {
	  user = new User({
	    googleId: profile.id,
	    name: profile.displayName,
	    email: profile.email
	  });
	  user.save();
	}
	done(err, user);
      });
  });
}

var facebookCallback = function(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
    User.findOne(
      { facebookId: profile.id },
      function (err, user) {
	if (!user) {
	  user = new User({
	    facebookId: profile.id,
	    name: profile.displayName
	  });
	  user.save();
	}
	done(err, user);
      });
  });
}

export default function authInit(passport) {
  passport.serializeUser(function(user, done) {
    console.log("serialized");
    done(null, user._id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      console.log("deserialized");
      done(err, user);
    });
  });

  passport.use(new OAuth2Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  }, googleCallback));

  passport.use(new Strategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/auth/facebook/callback"
  }, facebookCallback));
}
