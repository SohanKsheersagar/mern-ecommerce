const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const keys = require('./keys');
const { EMAIL_PROVIDER } = require('../constants');

const { google, facebook } = keys;
const User = mongoose.model('User');
const secret = keys.jwt.secret;

// JWT STRATEGY
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secret
};

passport.use(
  new JwtStrategy(opts, (payload, done) => {
    User.findById(payload.id)
      .then(user => (user ? done(null, user) : done(null, false)))
      .catch(err => done(err, false));
  })
);

// EXPORT INIT FUNCTION
module.exports = async app => {
  app.use(passport.initialize());
  await googleAuth();
  await facebookAuth();
};

// GOOGLE STRATEGY
const googleAuth = async () => {
  try {
    passport.use(
      new GoogleStrategy(
        {
          clientID: google.clientID,
          clientSecret: google.clientSecret,
          callbackURL: google.callbackURL
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ email: profile.email });

            if (!user) {
              const name = profile.displayName.split(' ');
              user = new User({
                provider: EMAIL_PROVIDER.Google,
                googleId: profile.id,
                email: profile.email,
                firstName: name[0],
                lastName: name[1] || '',
                avatar: profile.picture,
                password: null
              });
              await user.save();
            }

            // ✅ Add token to user object
            const payload = { id: user.id };
            const token = jwt.sign(payload, secret, { expiresIn: keys.jwt.tokenLife });
            user.token = token;

            return done(null, user);
          } catch (err) {
            return done(err, false);
          }
        }
      )
    );
  } catch (error) {
    console.log('Missing google keys');
  }
};

// FACEBOOK STRATEGY
const facebookAuth = async () => {
  try {
    passport.use(
      new FacebookStrategy(
        {
          clientID: facebook.clientID,
          clientSecret: facebook.clientSecret,
          callbackURL: facebook.callbackURL,
          profileFields: ['id', 'displayName', 'name', 'emails', 'picture.type(large)']
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ facebookId: profile.id });

            if (!user) {
              user = new User({
                provider: EMAIL_PROVIDER.Facebook,
                facebookId: profile.id,
                email: profile.emails ? profile.emails[0].value : null,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                avatar: profile.photos[0].value,
                password: null
              });
              await user.save();
            }

            // ✅ Add token to user object
            const payload = { id: user.id };
            const token = jwt.sign(payload, secret, { expiresIn: keys.jwt.tokenLife });
            user.token = token;

            return done(null, user);
          } catch (err) {
            return done(err, false);
          }
        }
      )
    );
  } catch (error) {
    console.log('Missing facebook keys');
  }
};
