import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cors from 'cors';
import dotenv from 'dotenv';
import connectPgSimple from 'connect-pg-simple';
import bcrypt from 'bcrypt';
import { db } from './storage';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

dotenv.config();

const sanitizeUser = (user: any) => {
  const { password, ...sanitized } = user;
  return sanitized;
};

const requiredEnvVars = ['DATABASE_URL', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'SESSION_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please configure these variables before starting the server.');
  process.exit(1);
}

if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
  console.error('❌ SESSION_SECRET must be at least 32 characters for security.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

const isDevelopment = process.env.NODE_ENV !== 'production';
const replitDomain = process.env.REPLIT_DEV_DOMAIN;
const FRONTEND_URL = process.env.FRONTEND_URL || (replitDomain ? `https://${replitDomain}` : 'http://localhost:5000');
const BACKEND_URL = process.env.BACKEND_URL || (replitDomain ? `https://${replitDomain}` : `http://localhost:${PORT}`);

const PgSession = connectPgSimple(session);

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

app.use(express.json());

app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL!,
    tableName: 'session',
    createTableIfMissing: false
  }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000
  },
  name: 'kindred.sid'
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || `${BACKEND_URL}/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.googleId, profile.id))
        .limit(1);

      if (existingUser.length > 0) {
        const user = existingUser[0];
        await db
          .update(users)
          .set({
            name: profile.displayName,
            profilePicture: profile.photos?.[0]?.value,
            updatedAt: new Date()
          })
          .where(eq(users.id, user.id));

        return done(null, user);
      }

      const newUser = await db
        .insert(users)
        .values({
          googleId: profile.id,
          email: profile.emails?.[0]?.value || '',
          name: profile.displayName,
          profilePicture: profile.photos?.[0]?.value,
          languageCode: 'en-US',
          voiceName: null
        })
        .returning();

      return done(null, newUser[0]);
    } catch (error) {
      return done(error as Error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    done(null, user[0] || null);
  } catch (error) {
    done(error);
  }
});

app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${FRONTEND_URL}?auth=error`,
    failureMessage: true
  }),
  (req, res) => {
    res.redirect(`${FRONTEND_URL}?auth=success`);
  }
);

// Email/Password Authentication Endpoints
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        languageCode: 'en-US',
        voiceName: null
      })
      .returning();

    // Log user in
    req.login(newUser[0], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to log in after signup' });
      }
      res.json({ user: sanitizeUser(newUser[0]), message: 'Account created successfully' });
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = existingUser[0];

    // Check if user has a password (not a Google OAuth user)
    if (!user.password) {
      return res.status(401).json({ error: 'This email is linked to Google Sign-In. Please use "Continue with Google"' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Log user in
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to log in' });
      }
      res.json({ user: sanitizeUser(user), message: 'Logged in successfully' });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

app.get('/api/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: sanitizeUser(req.user) });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

app.put('/api/user/profile', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = req.user as any;
  const { name, languageCode, voiceName, profilePicture } = req.body;

  const allowedUpdates: any = {};
  if (name !== undefined) allowedUpdates.name = name;
  if (languageCode !== undefined) allowedUpdates.languageCode = languageCode;
  if (voiceName !== undefined) allowedUpdates.voiceName = voiceName;
  if (profilePicture !== undefined) allowedUpdates.profilePicture = profilePicture;

  if (Object.keys(allowedUpdates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  try {
    await db
      .update(users)
      .set({
        ...allowedUpdates,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    const updatedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    res.json({ user: sanitizeUser(updatedUser[0]) });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Kindred AI Backend running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
