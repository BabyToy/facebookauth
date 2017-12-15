/*eslint valid-jsdoc: "off"*/
/*eslint-env es6*/
'use strict';

const request = require('request-promise-native');
const config = require('./config');

module.exports = (app) => {
  const userFieldSet = 'name, link, is_verified, picture, email';
  const pageFieldSet = 'name, category, link, picture, is_verified, email';

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
        // Pagination will not be covered in this post,
        // so we only need the data property of the parsed response.
        const parsedRes = JSON.parse(fbRes).data;
        res.json(parsedRes);
      })
      .catch(error => {
        res.send(error.message);
      });
  });
};
