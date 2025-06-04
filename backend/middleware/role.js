const check = roles => {
  // Ensure it's always treated as an array
  if (!Array.isArray(roles)) {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).send('Unauthorized');
    }

    const hasRole = roles.includes(req.user.role);
    if (!hasRole) {
      return res.status(403).send('You are not allowed to make this request.');
    }

    return next();
  };
};

module.exports = { check };
