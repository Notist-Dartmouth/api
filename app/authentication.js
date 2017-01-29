import User from './models/user';
import OAuth2Strategy from 'passport-google-oauth2';

const GOOGLE_CLIENT_ID = "739501964319-pbncdr2bmsqr7ra8tmng8m0b0pks9bfp.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "dhhLw29jwYRXykrlqxteJONR";

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

  passport.use(new OAuth2Strategy(
    {
      clientID:     GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOne(
	{
	  googleId: profile.id,
	  name: profile.displayName
	},
	function (err, user) {
	  if (!user) {
	    user = new User({googleId: profile.id, name: profile.displayName});
	    user.save();
	  }
	  return done(err, user);
	}
      );
    }
  ));
}
