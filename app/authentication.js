import User from './models/user';
import OAuth2Strategy from 'passport-google-oauth2';
import FacebookStrategy from 'passport-facebook';

var authCallback = function(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
    User.findOne({"$or": [
      {facebookId: profile.id},
      {googleId: profile.id},
      {email: {"$in": profile.emails.map(e => e.value)}}
    ]}, function (err, user) {
      if (!user) {
	user = new User({
	  name: profile.displayName,
	  email: profile.emails[0].value
	});
      }
      if (profile.provider === 'facebook') {
	user.facebookId = profile.id;
      } else if (profile.provider === 'google') {
	user.googleId = profile.id;
      }
      user.save();
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
  }, authCallback));

  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/auth/facebook/callback",
    profileFields: ['email']
  }, authCallback));
}
