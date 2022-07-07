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
  handleTruckCollectionUpdated,
} = require('../jobs/handleTruckCollectionUpdated');
const {OL, IS} = require('../constants/truckStatuses');
const {DRIVER} = require('../constants/userRoles');

const truckSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: [IS, OL],
  },
  name: String,
  type: String,
  dimensions: {
    width: {type: Number, required: true},
    height: {type: Number, required: true},
    length: {type: Number, required: true},
  },
  maxPayload: {type: Number, required: true},
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: DRIVER,
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: DRIVER,
  },
});

truckSchema.post('save', handleTruckCollectionUpdated);

const Truck = mongoose.model('Truck', truckSchema);

module.exports = Truck;