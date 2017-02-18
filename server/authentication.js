import User from './models/user';
import OAuth2Strategy from 'passport-google-oauth2';
import FacebookStrategy from 'passport-facebook';

const authCallback = (accessToken, refreshToken, profile, done) => {
  process.nextTick(() => {
    User.findOne({ $or: [
      { facebookId: profile.id },
      { googleId: profile.id },
      { email: { $in: profile.emails.map(e => { return e.value; }) } },
    ] }, (err, user) => {
      let myUser;
      if (!user) {
        myUser = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          groupIds: [],
        });
      } else {
        myUser = user;
      }
      if (profile.provider === 'facebook') {
        myUser.facebookId = profile.id;
      } else if (profile.provider === 'google') {
        myUser.googleId = profile.id;
      }
      console.log(myUser);
      myUser.save()
        .then((result) => {
          done(null, myUser);
        })
        .catch((err) => {
          done(err);
        });
    });
  });
};

export default function authInit(passport) {
  passport.serializeUser((user, done) => {
    console.log('serialized');
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      console.log('deserialized');
      done(err, user);
    });
  });

  passport.use(new OAuth2Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  }, authCallback));

  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'email'],
  }, authCallback));
}
