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

const Driver = require('../model/driver.model');
const Truck = require('../model/truck.model');
const Load = require('../model/load.model');
const truckService = require('./TruckService');
const {
  CANNOT_REASSIGN_TRUCK_OL,
  USER_LACKS_AUTHORITY,
  NO_TRUCK_ASSIGNED,
  NO_LOAD_ASSIGNED,
} = require('../constants/errors');
const HttpError = require('../utils/HttpError');

class DriverService {
  async assignTruck(driverId, truckId) {
    const newTruck = await Truck.findById(truckId);
    const driver = await Driver.findById(driverId).populate('truck').exec();

    if (!driver.equals(newTruck.createdBy)) {
      throw new HttpError(403, USER_LACKS_AUTHORITY);
    }
    if (driver.assignedLoad) {
      throw new HttpError(409, CANNOT_REASSIGN_TRUCK_OL);
    }

    const oldTruck = driver.truck;

    if (oldTruck) {
      await truckService.unassignDriverFromTruck(oldTruck.id);
    }
    await driver.update({truck: newTruck});
    newTruck.assignedTo = driver;
    await newTruck.save();

    return Truck.findById(newTruck);
  }

  async getAssignedDriverLoad(driverId) {
    const driver =
        await Driver.findById(driverId).populate('assignedLoad').exec();

    const {assignedLoad} = driver;

    if (!assignedLoad) {
      throw new HttpError(409, NO_LOAD_ASSIGNED);
    }

    return assignedLoad;
  }

  async getAssignedDriverTruck(driverDto) {
    const driver = await Driver.findById(driverDto).populate('truck').exec();
    const assignedTruck = driver.truck;

    if (!assignedTruck) {
      throw new HttpError(409, NO_TRUCK_ASSIGNED);
    }

    return assignedTruck;
  }

  async assignLoad(driverId, loadId) {
    const newLoad = await Load.findById(loadId);
    const driver =
        await Driver.findById(driverId).populate('assignedLoad').exec();

    await newLoad.update({assignedTo: driver});
    await newLoad.addLog(`Assigned to driver with id: ${driver._id}`);

    await driver.update({assignedLoad: newLoad});

    return Driver.findById(driverId);
  }
}

module.exports = new DriverService();