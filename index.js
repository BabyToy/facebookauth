/*eslint valid-jsdoc: "off"*/
/*eslint-env es6*/
'use strict';

const express = require('express');
const app = express();
const parser = require('body-parser');
const faceBook = require('./facebook');
const os = require('os');

app.use(parser.json());
app.use(parser.urlencoded({ extended: false }));
app.use(function (error, request, response, next) {
  if (response.headersSent) {
    next(error);
  }

  const errors = [
    //Google
    { errorText: 'No pem found for envelope', message: 'Invalid token - no pem found', httpCode: 200 },
    { errorText: 'Token used too late', message: 'Expired token', httpCode: 200 },
    { errorText: 'Invalid token signature', message: 'Invalid token', httpCode: 200 },
    { errorText: 'Google account already registered', message: 'Google account already registered', httpCode: 200 },
    { errorText: 'Wrong recipient, payload audience != requiredAudience', message: 'Invalid token', httpCode: 200 },
    { errorText: 'Google account unregistered', message: 'Google account unregistered', httpCode: 200 },
    { errorText: "Can't parse token envelope", message: 'Invalid token', httpCode: 200 },
    { errorText: 'Token not found', message: 'Invalid token', httpCode: 200 },
    { errorText: 'Token expired', message: 'Expired token', httpCode: 200 },
    //Facebook
    { errorText: 'The access token could not be decrypted', message: 'Invalid token', httpCode: 200 },
    { errorText: 'Facebook ID already linked to another user', message: 'Facebook ID already linked to another user', httpCode: 200 },
    { errorText: 'Account already linked', message: 'Account already linked', httpCode: 200 },
    { errorText: 'Facebook ID already registered', message: 'Facebook ID already registered', httpCode: 200 }
  ];

  let errorObject;
  for (var thisError of errors) {
    if (error.message.indexOf(thisError.errorText) > -1) {
      errorObject = thisError;
      break;
    }
  }

  if (errorObject) {
    response.status(errorObject.httpCode).json({
      status: 'Failed',
      result: errorObject.message
    });
    return;
  }
  next(error);
});

let listener = app.listen(80, function () {
  console.log('http://' + os.hostname() + ':' + listener.address().port);
});

app.get('/', function (request, response) {
  response.send('Login listening on http://' + os.hostname() + ':' + listener.address().port);
});

faceBook(app);
