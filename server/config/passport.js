const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { User } = require('../models');

// Passport session setup
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({
            where: { email: profile.emails[0].value }
          });

          if (user) {
            if (!user.googleId) {
              user.googleId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          // ✅ FIX: Fallback dla lastName
          user = await User.create({
            email: profile.emails[0].value,
            firstName: profile.name.givenName || 'User',
            lastName: profile.name.familyName || 'Google', // ✅ Fallback!
            googleId: profile.id,
            password: Math.random().toString(36).slice(-8),
          });

          return done(null, user);
        } catch (error) {
          console.error('Google OAuth error:', error);
          return done(error, null);
        }
      }
    )
  );
} else {
  console.log('⚠️  Google OAuth not configured (missing credentials in .env)');
}

// GitHub Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: '/api/auth/github/callback',
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0]
            ? profile.emails[0].value
            : `${profile.username}@github.user`;

          let user = await User.findOne({
            where: { email: email }
          });

          if (user) {
            if (!user.githubId) {
              user.githubId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          const fullName = profile.displayName || profile.username || '';
          const nameParts = fullName.split(' ');

          // ✅ FIX: Fallback dla lastName
          user = await User.create({
            email: email,
            firstName: nameParts[0] || profile.username || 'User',
            lastName: nameParts[1] || 'GitHub', // ✅ Fallback!
            githubId: profile.id,
            password: Math.random().toString(36).slice(-8),
          });

          return done(null, user);
        } catch (error) {
          console.error('GitHub OAuth error:', error);
          return done(error, null);
        }
      }
    )
  );
} else {
  console.log('⚠️  GitHub OAuth not configured (missing credentials in .env)');
}

module.exports = passport;