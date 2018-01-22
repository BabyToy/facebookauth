/*eslint valid-jsdoc: "off"*/
/*eslint-env es6*/
'use strict';

const request = require('request-promise-native');
const config = require('./config');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const parser = require('body-parser');

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(new FacebookStrategy({
  clientID: process.env.FB_CLIENT_ID,
  clientSecret: process.env.FB_CLIENT_SECRET,
  callbackURL: 'http://localhost/facebook/login/callback'
}, function (accessToken, refreshToken, profile, callBack) {
  process.nextTick(function () {
    return callBack(null, profile);
  });
}));

module.exports = (app) => {
  app.use(parser.json());
  app.use(parser.urlencoded({ extended: false }));

  app.use(passport.initialize());
  app.use(passport.session());

  const userFieldSet = 'name, link, is_verified, picture, email';
  const pageFieldSet = 'name, category, link, picture, is_verified, email';

  app.get('/facebook/login', passport.authenticate('facebook',
    {
      scope: 'email',
      authType: 'reauthenticate'
    }));

  app.get('/facebook/login/callback', passport.authenticate('facebook', { failureRedirect: '/facebook/login' }),
    function (request, response) {
      response.redirect('/');
    });

  app.get('/healthcheck', (request, response, next) => {
    response.status(200).send('OK');
  });

  app.post('/facebook-search', (req, res) => {
    const { queryTerm, searchType } = req.body;

    const options = {
      method: 'GET',
      uri: 'https://graph.facebook.com/search',
      qs: {
        access_token: config.userAccessToken,
        q: queryTerm,
        type: searchType,
        fields: searchType === 'page' ? pageFieldSet : userFieldSet
      }
    };

    request(options)
      .then(fbRes => {
        // Search results are in the data property of the response.
        // There is another property that allows for pagination of results.
        const parsedRes = JSON.parse(fbRes).data;
        res.json(parsedRes);
      })
      .catch(error => {
        res.send(error.message);
      });
  });
};
