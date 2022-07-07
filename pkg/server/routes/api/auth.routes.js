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

const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const userService = require('../../service/UserService');
const authService = require('../../service/AuthService');
const registerValidation = require('../validation/auth/registerValidation');
const loginValidation = require('../validation/auth/loginValidation');
const emailForResetPasswordValidation =
  require('../validation/auth/emailForResetPasswordValidation');
const resetPasswordValidation =
  require('../validation/auth/resetPasswordValidation');
const {
  USER_REGISTERED,
  USER_AUTHENTICATED,
  PASSWORD_RESET_EMAIL_SENT,
  PASSWORD_CHANGED,
} = require('../../constants/responseStatuses');

/**
 * @api {post} /api/auth/login Authenticate user
 *
 * @apiName Login
 * @apiGroup Auth
 *
 * @apiParam {String} username current user username
 * @apiParam {String} password current user password
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "username": "Potato"
 *       "password": "123"
 *     }
 *
 * @apiSuccess (200) {String} status Response status text
 * @apiSuccess (200) {String} token user JWT token
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "User authenticated successfully",
 *       "token": "adde238h238hfuhf289pf892fh2f23fphf2p"
 *     }
 */
router.post('/login', loginValidation, async (req, res, next) => {
  const userData = req.body;

  try {
    const user = await userService.findByCredentials(userData);
    const token = authService.generateToken(user);

    res.json({status: USER_AUTHENTICATED, token});
  } catch (err) {
    return next(err);
  }
});

/**
 * @api {post} /api/auth/register Register user
 *
 * @apiName Register
 * @apiGroup Auth
 *
 * @apiParam {String} username
 * @apiParam {String} password
 * @apiParam {String} email
 * @apiParam {String} role [driver, shipper]
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "username": "Potato"
 *       "password": "123",
 *       "email": "potato123@gmail.com",
 *       "role": "shipper"
 *     }
 *
 * @apiSuccess (200) {String} status Response status text
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "User registered successfully",
 *     }
 */
router.post('/register', registerValidation, async (req, res, next) => {
  const registerUserDto = req.body;

  try {
    await userService.createUserOfRole(registerUserDto);
    res.json({status: USER_REGISTERED});
  } catch (err) {
    return next(err);
  }
});

/**
 * @api {post} /api/auth/forgot Send reset password email
 *
 * @apiName ForgotPassword
 * @apiGroup Auth
 *
 * @apiParam {String} email User email
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "email": "Potato@gmail.com"
 *     }
 *
 * @apiSuccess (200) {String} status Response status text
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "An email with further instructions has been sent"
 *     }
 */
router.post('/forgot',
    emailForResetPasswordValidation,
    async (req, res, next) => {
      const {email} = req.body;
      try {
        await userService.sendPasswordResetToken(email);
        res.json({status: PASSWORD_RESET_EMAIL_SENT});
      } catch (err) {
        next(err);
      }
    });

/**
 * @api {put} /api/auth/password/:token Reset password
 *
 * @apiName ResetPassword
 * @apiGroup Auth
 *
 * @apiParam {String} token Token obtained from email
 * @apiParam {String} password New password
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "password": "123abc"
 *     }
 *
 * @apiSuccess (200) {String} status Response status text
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "Password successfully changed"
 *     }
 */
router.put('/password/:token',
    resetPasswordValidation,
    async (req, res, next) => {
      const {password} = req.body;
      const {token} = req.params;
      try {
        await userService.resetPassword(token, password);
        res.json({status: PASSWORD_CHANGED});
      } catch (err) {
        next(err);
      }
    });

module.exports = router;