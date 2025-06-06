// backend/middleware/auth.js
const { auth } = require('express-oauth2-jwt-bearer');

// Middleware Auth0 : vérifie le token JWT
const jwtCheck = auth({
  audience: 'https://riveltime/api',
  issuerBaseURL: 'https://dev-x240f0akkby8jtyr.us.auth0.com/',
  tokenSigningAlg: 'RS256',
});

// Middleware complémentaire : injecte les infos utilisateur dans req.user
const injectUser = (req, res, next) => {
  if (req.auth) {
    req.user = req.auth;
  }
  next();
};

module.exports = { jwtCheck, injectUser };
