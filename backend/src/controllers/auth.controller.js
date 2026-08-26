import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../middleware/auth.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Called after passport's Google strategy has attached req.user (via callback route).
export function googleCallback(req, res) {
  const token = signToken(req.user);
  setAuthCookie(res, token);
  // Original allauth flow's LOGIN_REDIRECT_URL = '/' - ported exactly.
  res.redirect(`${env.frontendUrl}/`);
}

// Called via axios.post() from the SPA (unlike googleCallback, which is a
// real browser navigation) - so this responds with JSON, not a redirect.
export function logout(req, res) {
  clearAuthCookie(res);
  res.json({ ok: true });
}

// New functionality (not present in the original app, added by request):
// local email+password auth, available to customers as well as admins,
// alongside the existing Google OAuth flow. If someone registers with an
// email/password and later signs in with Google using that same email,
// passport.js's upsert-by-email logic attaches googleId to the same account
// rather than creating a duplicate - both login methods lead to one account.
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    email: normalizedEmail,
    name: name?.trim() || normalizedEmail.split('@')[0],
    passwordHash,
  });

  const token = signToken(user);
  setAuthCookie(res, token);
  res.status(201).json({ user: { id: user._id, email: user.email, name: user.name, role: user.role } });
});

// Generic email+password login - works for any account that has a
// passwordHash set, whether it was created via registration or via
// `npm run seed` (the bootstrap admin account). Role-based access (e.g. to
// /admin) is enforced separately by requireAdmin/AdminRoute, not here.
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+passwordHash');
  const genericError = { message: 'Invalid email or password' };

  if (!user || !user.passwordHash) {
    return res.status(401).json(genericError);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json(genericError);

  const token = signToken(user);
  setAuthCookie(res, token);
  res.json({ user: { id: user._id, email: user.email, name: user.name, role: user.role } });
});

export function me(req, res) {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  const { _id, email, name, avatarUrl, role } = req.user;
  res.json({ user: { id: _id, email, name, avatarUrl, role } });
}
