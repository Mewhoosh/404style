const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { User } = require('../models');

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({
          where: {
            email: profile.emails[0].value,
          },
        });

        if (user) {
          // User exists, update OAuth info if not set
          if (!user.oauthProvider) {
            user.oauthProvider = 'google';
            user.oauthId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        // Create new user with Google data
        user = await User.create({
          email: profile.emails[0].value,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          oauthProvider: 'google',
          oauthId: profile.id,
          password: Math.random().toString(36).slice(-8),
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// GitHub Strategy
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
        // GitHub może nie zwrócić email jeśli jest private
        const email = profile.emails && profile.emails[0] 
          ? profile.emails[0].value 
          : `${profile.username}@github.user`;

        // Check if user exists
        let user = await User.findOne({
          where: {
            email: email,
          },
        });

        if (user) {
          // User exists, update OAuth info if not set
          if (!user.oauthProvider) {
            user.oauthProvider = 'github';
            user.oauthId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        // Parse name (GitHub może mieć pełne imię lub username)
        const fullName = profile.displayName || profile.username || '';
        const nameParts = fullName.split(' ');
        
        // Create new user with GitHub data
        user = await User.create({
          email: email,
          firstName: nameParts[0] || profile.username,
          lastName: nameParts[1] || '',
          oauthProvider: 'github',
          oauthId: profile.id,
          password: Math.random().toString(36).slice(-8),
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

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

module.exports = passport;