const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');

const auth = require('../../middleware/auth');
const User = require('../../models/user');
const mailchimp = require('../../services/mailchimp');
const mailgun = require('../../services/mailgun');
const keys = require('../../config/keys');
const { EMAIL_PROVIDER, JWT_COOKIE } = require('../../constants');

const { secret, tokenLife } = keys.jwt;

// -----------------------------
// Email/Password Login
// -----------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'No user found with this email.' });

    if (user.provider !== EMAIL_PROVIDER.Email) {
      return res.status(400).json({ error: `Email used with ${user.provider} login.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect password.' });

    const payload = { id: user.id };
    const token = jwt.sign(payload, secret, { expiresIn: tokenLife });

    res.status(200).json({
      success: true,
      token: `Bearer ${token}`,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// -----------------------------
// Registration
// -----------------------------
router.post('/register', async (req, res) => {
  try {
    const { email, firstName, lastName, password, isSubscribed } = req.body;

    if (!email || !firstName || !lastName || !password)
      return res.status(400).json({ error: 'All fields are required.' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already in use.' });

    let subscribed = false;
    if (isSubscribed) {
      const result = await mailchimp.subscribeToNewsletter(email);
      if (result.status === 'subscribed') subscribed = true;
    }

    const user = new User({ email, password, firstName, lastName });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    const registeredUser = await user.save();

    await mailgun.sendEmail(registeredUser.email, 'signup', null, registeredUser);

    const payload = { id: registeredUser.id };
    const token = jwt.sign(payload, secret, { expiresIn: tokenLife });

    res.status(200).json({
      success: true,
      subscribed,
      token: `Bearer ${token}`,
      user: {
        id: registeredUser.id,
        firstName: registeredUser.firstName,
        lastName: registeredUser.lastName,
        email: registeredUser.email,
        role: registeredUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// -----------------------------
// Forgot Password
// -----------------------------
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'No user found with this email.' });

    const buffer = crypto.randomBytes(48);
    const resetToken = buffer.toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await mailgun.sendEmail(user.email, 'reset', req.headers.host, resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Error sending reset link.' });
  }
});

// -----------------------------
// Reset Password
// -----------------------------
router.post('/reset/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: 'Reset token is invalid or expired.' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    await mailgun.sendEmail(user.email, 'reset-confirmation');

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Password reset failed.' });
  }
});

// -----------------------------
// JWT-Protected Reset (Authenticated)
/// -----------------------------
router.post('/reset', auth, async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const user = await User.findOne({ email: req.user.email });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Old password incorrect.' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(confirmPassword, salt);
    await user.save();

    await mailgun.sendEmail(user.email, 'reset-confirmation');
    res.status(200).json({ success: true, message: 'Password updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not update password.' });
  }
});

// -----------------------------
// Google Auth Routes
// -----------------------------
router.get(
  '/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
    accessType: 'offline',
    approvalPrompt: 'force'
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${keys.app.clientURL}/login`,
    session: false
  }),
  (req, res) => {
    const jwtToken = `Bearer ${req.user.token}`;
    res.redirect(`${keys.app.clientURL}/auth/success?token=${jwtToken}`);
  }
);

// -----------------------------
// Facebook Auth Routes
// -----------------------------
router.get(
  '/facebook',
  passport.authenticate('facebook', {
    session: false,
    scope: ['public_profile', 'email']
  })
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: `${keys.app.clientURL}/login`,
    session: false
  }),
  (req, res) => {
    const jwtToken = `Bearer ${req.user.token}`;
    res.redirect(`${keys.app.clientURL}/auth/success?token=${jwtToken}`);
  }
);

module.exports = router;
