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

export const BASE_API_URL = 'http://localhost:5050/api';

export const LOGIN_URL = BASE_API_URL + '/login';

export const REGISTER_URL = BASE_API_URL + '/register';

export const USERNAME_AVAILABLE_BASE_URL = BASE_API_URL + '/users/';

export const APP_NAME = 'bhojpur-shipping';

export const CURRENT_USER_URL = BASE_API_URL + '/me';

export const GET_TRUCKS_URL = BASE_API_URL + '/trucks';

export const UPDATE_TRUCK_URL =
    (truckId) => `${BASE_API_URL}/trucks/${truckId}`;

export const ASSIGN_TRUCK_URL =
  (userId) => `${BASE_API_URL}/users/${userId}/assignedTrucks`;

export const DELETE_TRUCK_URL =
    (truckId) => `${BASE_API_URL}/trucks/${truckId}`;

export const CREATE_TRUCK_URL = BASE_API_URL + '/trucks';

export const CHANGE_PASSWORD_URL =
    (userId) => `${BASE_API_URL}/users/${userId}/password`;

export const GET_LOADS_URL = BASE_API_URL + '/loads';

export const UPDATE_LOAD_URL =
    (loadId) => `${BASE_API_URL}/loads/${loadId}`;

export const DELETE_LOAD_URL =
    (loadId) => `${BASE_API_URL}/loads/${loadId}`;

export const CREATE_LOAD_URL = BASE_API_URL + '/loads';