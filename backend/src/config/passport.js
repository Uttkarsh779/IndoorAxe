import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.js';
import User from '../models/User.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: env.googleCallbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('Google account has no email'));

        let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

        if (!user) {
          const isBootstrapAdmin =
            env.bootstrapAdminEmail && email.toLowerCase() === env.bootstrapAdminEmail.toLowerCase();
          user = await User.create({
            googleId: profile.id,
            email,
            name: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value || '',
            role: isBootstrapAdmin ? 'admin' : 'customer',
          });
        } else {
          user.googleId = user.googleId || profile.id;
          user.name = profile.displayName || user.name;
          user.avatarUrl = profile.photos?.[0]?.value || user.avatarUrl;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Sessions aren't used (JWT cookie instead), but passport requires these to be defined.
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
