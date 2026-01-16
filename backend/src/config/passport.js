const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GithubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/v1/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create user based on Google profile
      let user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        return done(null, user);
      }
      
      // Create new user
      user = await User.create({
        username: profile.displayName,
        email: profile.emails[0].value,
        password: profile.id, // Use Google ID as password (won't be used for login)
        googleId: profile.id
      });
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// GitHub OAuth Strategy
passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/api/v1/auth/github/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create user based on GitHub profile
      let user = await User.findOne({ email: profile.emails ? profile.emails[0].value : null });
      
      if (user) {
        return done(null, user);
      }
      
      // Create new user
      user = await User.create({
        username: profile.username || profile.displayName,
        email: profile.emails ? profile.emails[0].value : null,
        password: profile.id, // Use GitHub ID as password (won't be used for login)
        githubId: profile.id
      });
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
