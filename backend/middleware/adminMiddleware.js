const admin = (req, res, next) => {
  // This middleware should run AFTER the 'protect' middleware,
  // so the req.user object will be available.
  if (req.user && req.user.role === 'admin') {
    next(); // If the user is an admin, proceed to the controller function
  } else {
    // If not an admin, send a 'Forbidden' error
    res.status(403).json({ message: 'Access denied. Requires admin privileges.' });
  }
};

module.exports = { admin };