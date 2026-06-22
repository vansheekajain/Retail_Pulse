const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../models');

const signToken = (userId) =>
  jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// ── Register ──────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { name, email, password, phone, preferredLanguage } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      preferredLanguage: preferredLanguage || 'en',
    });

    const token = signToken(user.id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id:                user.id,
        name:              user.name,
        email:             user.email,
        role:              user.role,
        preferredLanguage: user.preferredLanguage,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Login ─────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email, isActive: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user.id);

    res.json({
      token,
      user: {
        id:                user.id,
        name:              user.name,
        email:             user.email,
        role:              user.role,
        preferredLanguage: user.preferredLanguage,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Me ────────────────────────────────────────────────
exports.me = async (req, res) => {
  const { id, name, email, phone, role, preferredLanguage } = req.user;
  res.json({ id, name, email, phone, role, preferredLanguage });
};

// ── Logout ────────────────────────────────────────────
exports.logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};