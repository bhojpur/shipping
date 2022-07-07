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

import axios from 'axios';
import {
  ASSIGN_TRUCK_URL,
  CREATE_TRUCK_URL,
  DELETE_TRUCK_URL,
  GET_TRUCKS_URL,
  UPDATE_TRUCK_URL,
} from '../globals/routeConstants';

export const getTrucks = () => {
  return axios.get(GET_TRUCKS_URL)
      .then((response) => response.data);
};

export const putTruck = (truckId, truckData) => {
  return axios.put(UPDATE_TRUCK_URL(truckId), truckData)
      .then((response) => response.data);
};

export const postAssignTruck = (userId, truckId) => {
  return axios.post(ASSIGN_TRUCK_URL(userId), {truckId})
      .then((response) => response.data);
};

export const deleteTruck = (truckId) => {
  return axios.delete(DELETE_TRUCK_URL(truckId))
      .then((response) => response.data);
};

export const postCreateTruck = (truckData) => {
  return axios.post(CREATE_TRUCK_URL, truckData)
      .then((response) => response.data);
};