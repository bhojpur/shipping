// Copyright (c) 2018 Bhojpur Consulting Private Limited, India. All rights reserved.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

const jwt = require('jsonwebtoken');
const config = require('config');
const salt = config.get('jwtSalt');
const userService = require('./UserService');
const moment = require('moment');
const {TOKEN_NOT_VALID, TOKEN_EXPIRED} = require('../constants/errors');
const {decodedJwtSchema} =
  require('../routes/validation/middleware/decodedJwtSchema');
const HttpError = require('../utils/HttpError');


class AuthService {
  generateToken({username, role}) {
    const iat = Date.now();
    return jwt.sign(JSON.stringify({username, role, iat}), salt);
  }

  async validateUser(token) {
    const decodedToken = jwt.verify(token, salt);
    const {error} = decodedJwtSchema.validate(decodedToken);

    if (error) {
      throw new HttpError(400, TOKEN_NOT_VALID);
    }
    const {username, iat} = decodedToken;
    const foundUser = await userService.findByUsername(username);

    const isTokenExpired =
        !this.isTokenCreatedAfterPasswordChange(
            iat, foundUser.passwordLastChanged);

    if (isTokenExpired) {
      throw new HttpError(400, TOKEN_EXPIRED);
    }

    return foundUser;
  }

  isTokenCreatedAfterPasswordChange(tokenIat, passwordLastChanged) {
    const passwordLastChangedMoment = moment(passwordLastChanged);
    const tokenIatMoment = moment(tokenIat);

    return tokenIatMoment.isAfter(passwordLastChangedMoment);
  }
}

module.exports = new AuthService();