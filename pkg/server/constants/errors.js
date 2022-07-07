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

const NOT_AUTHORIZED = 'Not authorized to access this resource';
const WRONG_CREDENTIALS = 'Wrong credentials';
const USERNAME_TAKEN = 'Username taken';
const USERNAME_BLANK = 'Username cannot be blank';
const PASSWORD_BLANK = 'Password cannot be blank';
const USER_LACKS_AUTHORITY = 'User lacks authority';
const TRUCK_NOT_FOUND_BY_ID = 'Cannot find truck with given id';
const LOAD_NOT_FOUND_BY_ID = 'Cannot find load with given id';
const NO_LOAD_ASSIGNED = 'Driver does not have a load assigned';
const NO_TRUCK_ASSIGNED = 'Driver does not have a truck assigned';
const CANNOT_CHANGE_DATA_OL = 'Not possible to change truck data while on load';
const CANNOT_REASSIGN_TRUCK_OL =
    'Not possible change assigned truck while on load';
const CANNOT_CHANGE_DATA_ASSIGNED_TRUCK =
    'Not possible to change assigned truck data';
const CANNOT_REMOVE_ASSIGNED_TRUCK = 'Not possible to remove assigned truck';
const WRONG_OLD_PASSWORD = 'Wrong old password';
const TOKEN_NOT_VALID = 'Token not valid';
const TOKEN_EXPIRED = 'Token is expired';
const CANNOT_EDIT_NOT_NEW_LOAD =
    'Not possible to edit any load with status other than "NEW"';
const CANNOT_POST_NOT_NEW_LOAD =
    'Not possible to post any load with status other than "NEW"';
const CANNOT_CHANGE_ARRIVED_LOAD_STATE =
  'Not possible to change state for arrived load';
const WRONG_ID_FORMAT = 'Bad id format';
const CANNOT_FIND_LOCATION = 'Cannot find location';
const PASSWORD_TOKEN_NOT_VALID =
  'Password reset token is invalid or has expired.';

module.exports = {
  NOT_AUTHORIZED,
  WRONG_CREDENTIALS,
  USERNAME_TAKEN,
  USERNAME_BLANK,
  PASSWORD_BLANK,
  USER_LACKS_AUTHORITY,
  TRUCK_NOT_FOUND_BY_ID,
  LOAD_NOT_FOUND_BY_ID,
  NO_LOAD_ASSIGNED,
  NO_TRUCK_ASSIGNED,
  CANNOT_CHANGE_DATA_OL,
  CANNOT_REASSIGN_TRUCK_OL,
  CANNOT_CHANGE_DATA_ASSIGNED_TRUCK,
  CANNOT_REMOVE_ASSIGNED_TRUCK,
  WRONG_OLD_PASSWORD,
  TOKEN_NOT_VALID,
  TOKEN_EXPIRED,
  CANNOT_EDIT_NOT_NEW_LOAD,
  CANNOT_POST_NOT_NEW_LOAD,
  CANNOT_CHANGE_ARRIVED_LOAD_STATE,
  WRONG_ID_FORMAT,
  CANNOT_FIND_LOCATION,
  PASSWORD_TOKEN_NOT_VALID,
};