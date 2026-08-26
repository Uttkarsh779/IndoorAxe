import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export function setAuthCookie(res, token) {
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(env.cookieName);
}

/**
 * Equivalent of Django's @login_required(login_url='signup').
 * Responds 401 instead of redirecting - the React router redirects to /login itself.
 */
export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[env.cookieName];
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Authentication required' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Authentication required' });
  }
}

// Populates req.user if a valid cookie is present, but never blocks the request.
export async function attachUserIfPresent(req, res, next) {
  try {
    const token = req.cookies?.[env.cookieName];
    if (!token) return next();
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub);
    if (user) req.user = user;
    next();
  } catch (err) {
    next();
  }
}

/** Equivalent of Django admin's staff/superuser gate on /admin/*. */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}
