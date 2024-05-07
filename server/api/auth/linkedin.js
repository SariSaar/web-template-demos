// const passport = require('passport');
// // const passportLinkedin = require('passport-openidconnect');
// const passportLinkedin = require('passport-linkedin-oauth2');
// const loginWithIdp = require('./loginWithIdp');

// const radix = 10;
// const PORT = parseInt(process.env.REACT_APP_DEV_API_SERVER_PORT, radix);
// const rootUrl = process.env.REACT_APP_MARKETPLACE_ROOT_URL;
// const clientID = process.env.REACT_APP_LINKEDIN_CLIENT_ID;
// const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

// const LinkedinStrategy = passportLinkedin.Strategy;
// let callbackURL = null;

// const useDevApiServer = process.env.NODE_ENV === 'development' && !!PORT;

// if (useDevApiServer) {
//   callbackURL = `http://localhost:${PORT}/api/auth/linkedin/callback`;
// } else {
//   callbackURL = `${rootUrl}/api/auth/linkedin/callback`;
// }

// // const strategyOptions = {
// //   clientID,
// //   clientSecret,
// //   callbackURL,
// //   issuer: 'https://www.linkedin.com/',
// //   authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
// //   tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
// //   userInfoURL: 'https://api.linkedin.com/v2/userinfo',
// //   scope: ['profile', 'email', 'openid'],
// //   passReqToCallback: true,
// // };

// const strategyOptions = {
//   clientID,
//   clientSecret,
//   callbackURL,
//   scope: ['profile', 'email', 'openid'],
//   passReqToCallback: true,
// };

// /**
//  * Function Passport calls when a redirect returns the user from Linkedin to the application.
//  *
//  * Normally with Passport, this function is used to validate the received user data, and possibly
//  * create a new user and the `done` callback is a session management function provided by Passport.
//  * In our case, the Sharetribe SDK handles user creation and session management. Therefore, we only
//  * extract user data here and provide a custom session management function in
//  * `authenticateLinkedinCallback`, that servers as the `done` callback here.
//  *
//  * @param {Object} req Express request object
//  * @param {String} accessToken Access token obtained from Linkedin
//  * @param {String} refreshToken Refres token obtained from Linkedin
//  * @param {Object} profile Object containing user information
//  * @param {Function} done Session management function, introduced in `authenticateLinkedinCallback`
//  */
// // const verifyCallback = (req, accessToken, refreshToken, profile, done) => {
// const verifyCallback = (req, accessToken, refreshToken, tokens, profile, done) => {

//   const { id_token } = tokens;

//   console.log({ profile })

//   const { email, given_name, family_name, email_verified } = profile._json;
//   const state = req.query.state;
//   const queryParams = JSON.parse(state);

//   const { from, defaultReturn, defaultConfirm } = queryParams;

//   const userData = {
//     email,
//     firstName: given_name,
//     lastName: family_name,
//     idpToken: id_token,
//     emailVerified: email_verified,
//     refreshToken,
//     from,
//     defaultReturn,
//     defaultConfirm,
//   };

//   console.log('calling done with ', { userData });
//   done(null, userData);
// };

// // ClientId is required when adding a new Linkedin strategy to passport
// if (clientID) {
//   console.log({ strategyOptions });
//   passport.use(new LinkedinStrategy(strategyOptions, verifyCallback));
// }

// /**
//  * Initiate authentication with Linkedin. When the funcion is called, Passport redirects the
//  * user to Linkedin to perform authentication.
//  *
//  * @param {Object} req Express request object
//  * @param {Object} res Express response object
//  * @param {Function} next Call the next middleware function in the stack
//  */
// exports.authenticateLinkedin = (req, res, next) => {
//   const { from, defaultReturn, defaultConfirm } = req.query || {};
//   const params = {
//     ...(from ? { from } : {}),
//     ...(defaultReturn ? { defaultReturn } : {}),
//     ...(defaultConfirm ? { defaultConfirm } : {}),
//   };

//   const paramsAsString = JSON.stringify(params);

//   passport.authenticate('linkedin', {
//     scope: ['profile', 'email', 'openid'],
//     state: paramsAsString,
//   })(req, res, next);
// };

// /**
//  * This function is called when user returns to this application after authenticating with
//  * Linkedin. Passport verifies the recieved tokens and calls a callback function that we've defined
//  * for the authentication strategy and an additional session management function, that we introduce
//  * in this function.
//  *
//  * @param {Object} req Express request object
//  * @param {Object} res Express response object
//  * @param {Function} next Call the next middleware function in the stack
//  */
// exports.authenticateLinkedinCallback = (req, res, next) => {
//   // We've already defined the `verifyCallback` function for the Passport Linkedin authentication
//   // strategy. That function is normally used to verify the user information obtained from identity
//   // provider, or alternatively create a new use while an internal Passport function is used to
//   // store the user data into session. In our case however, we use the SDK to manage sessions.
//   // Therefore, we provide an additional session management function here, that is called from the
//   // `verifyCallback` fn.
//   const sessionFn = (err, user) => loginWithIdp(err, user, req, res, clientID, 'linkedin');

//   passport.authenticate('linkedin', sessionFn)(req, res, next);
// };

const passport = require('passport');
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const loginWithIdp = require('./loginWithIdp');
const { createIdToken } = require('../../api-util/idToken');

const radix = 10;
const PORT = parseInt(process.env.REACT_APP_DEV_API_SERVER_PORT, radix);
const rootUrl = process.env.REACT_APP_MARKETPLACE_ROOT_URL;
const clientID = process.env.REACT_APP_LINKEDIN_CLIENT_ID;
const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

// Identity provider and identity provider client information. They should
// match to an identity provider client "Client ID" and "IdP ID" in Console.
const idpClientId = process.env.LINKEDIN_PROXY_CLIENT_ID;
const idpId = process.env.LINKEDIN_PROXY_IDP_ID;

let callbackURL = null;

const useDevApiServer = process.env.NODE_ENV === 'development' && !!PORT;

if (useDevApiServer) {
  callbackURL = `http://localhost:${PORT}/api/auth/linkedin/callback`;
} else {
  callbackURL = `${rootUrl}/api/auth/linkedin/callback`;
}

const strategyOptions = {
  clientID,
  clientSecret,
  callbackURL,
  scope: ['profile', 'email', 'openid'],
  passReqToCallback: true,
};

const verifyCallback = (req, accessToken, refreshToken, profile, done) => {
  // We can can use util function to generate id token to match OIDC so that we can use
  // our custom id provider in Flex

  console.log({ profileJson: profile._json });

  const { given_name: firstName, family_name: lastName, email, email_verified } = profile._json;

  // const locale = Object.keys(profile._json.firstName.localized)[0];

  // const firstName = profile._json.firstName.localized[locale];
  // const lastName = profile._json.lastName.localized[locale];
  // const email = profile.emails[0].value;

  // LikedIn API doesn't return information if the email is verified or not directly.
  // However, it seems that with OAUTH2 flow authentication is not possible if the email is not verified.
  // There is no official documentation about this, but through testing it seems like this can be trusted
  // For reference: https://stackoverflow.com/questions/19278201/oauth-request-verified-email-address-from-linkedin

  const user = {
    userId: profile.id,
    firstName,
    lastName,
    email,
    emailVerified: email_verified,
  };

  const state = req.query.state;
  const queryParams = JSON.parse(state);

  const { from, defaultReturn, defaultConfirm } = queryParams;

  // These keys are used for signing the ID token (JWT)
  // When you store them to environment variables you should replace
  // any line brakes with '\n'.
  // You should also make sure that the key size is big enough.
  const rsaPrivateKey = process.env.RSA_PRIVATE_KEY;
  const keyId = process.env.KEY_ID;

  createIdToken(idpClientId, user, { signingAlg: 'RS256', rsaPrivateKey, keyId })
    .then(idpToken => {
      const userData = {
        email,
        firstName,
        lastName,
        idpToken,
        from,
        defaultReturn,
        defaultConfirm,
      };
      done(null, userData);
    })
    .catch(e => console.error(e));
};

// ClientId is required when adding a new Linkedin strategy to passport
if (clientID) {
  passport.use(new LinkedInStrategy(strategyOptions, verifyCallback));
}

exports.authenticateLinkedin = (req, res, next) => {
  const from = req.query.from ? req.query.from : null;
  const defaultReturn = req.query.defaultReturn ? req.query.defaultReturn : null;
  const defaultConfirm = req.query.defaultConfirm ? req.query.defaultConfirm : null;

  const params = {
    ...(!!from && { from }),
    ...(!!defaultReturn && { defaultReturn }),
    ...(!!defaultConfirm && { defaultConfirm }),
  };

  const paramsAsString = JSON.stringify(params);

  passport.authenticate('linkedin', {
    state: paramsAsString,
  })(req, res, next);
};

// Use custom callback for calling loginWithIdp enpoint
// to log in the user to Flex with the data from Linkedin
exports.authenticateLinkedinCallback = (req, res, next) => {
  passport.authenticate('linkedin', function(err, user) {
    loginWithIdp(err, user, req, res, idpClientId, idpId);
  })(req, res, next);
};
