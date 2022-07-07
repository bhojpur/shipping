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

const mongoose = require('mongoose');
const {
  NEW,
  POSTED,
  ASSIGNED,
  SHIPPED,
} = require('../constants/loadStatuses');
const {
  ROUTE_TO_PICK_UP,
  ARRIVED_TO_PICK_UP,
  ROUTE_TO_DELIVERY,
  ARRIVED_TO_DELIVERY,
} = require('../constants/loadStates');
const {SHIPPER, DRIVER} = require('../constants/userRoles');

const loadSchema = new mongoose.Schema({
  name: String,
  status: {
    type: String,
    enum: [
      NEW,
      POSTED,
      ASSIGNED,
      SHIPPED,
    ],
    required: true,
  },
  state: {
    type: String,
    enum: [
      ROUTE_TO_PICK_UP,
      ARRIVED_TO_PICK_UP,
      ROUTE_TO_DELIVERY,
      ARRIVED_TO_DELIVERY,
    ],
  },
  dimensions: {
    width: {type: Number, required: true},
    height: {type: Number, required: true},
    length: {type: Number, required: true},
  },
  payload: {type: Number, required: true},
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: SHIPPER,
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: DRIVER,
  },
  logs: [{
    message: String,
    time: {
      type: Date,
      default: Date.now,
    },
  }],
});

loadSchema.methods.addLog = async function(message) {
  this.logs.push({message});
  return this.save();
};

const Load = mongoose.model('Load', loadSchema);

module.exports = Load;