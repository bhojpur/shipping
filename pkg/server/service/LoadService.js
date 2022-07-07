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

const Load = require('../model/load.model');
const {
  NEW,
  POSTED,
  ASSIGNED,
  SHIPPED,
} = require('../constants/loadStatuses');
const truckService = require('./TruckService');
const driverService = require('./DriverService');
const Truck = require('../model/truck.model');
const {IS, OL} = require('../constants/truckStatuses');
const {
  USER_LACKS_AUTHORITY,
  LOAD_NOT_FOUND_BY_ID,
  CANNOT_EDIT_NOT_NEW_LOAD,
  CANNOT_POST_NOT_NEW_LOAD,
  CANNOT_CHANGE_ARRIVED_LOAD_STATE,
} = require('../constants/errors');
const {DRIVER, SHIPPER} = require('../constants/userRoles');
const {
  ROUTE_TO_PICK_UP,
  ARRIVED_TO_PICK_UP,
  ROUTE_TO_DELIVERY,
  ARRIVED_TO_DELIVERY,
} = require('../constants/loadStates');
const HttpError = require('../utils/HttpError');
const removeUndefinedKeys = require('../utils/removeUndefinedKeys');
const moment = require('moment');


class LoadService {
  findAll() {
    return Load.find();
  }

  findByCreatedUserId(userId, query, options) {
    query = removeUndefinedKeys(query);

    return Load.find({
      createdBy: userId,
      ...query,
    }).setOptions(options);
  }

  async findById(id) {
    const foundLoad = await Load.findById(id);
    if (!foundLoad) {
      throw new HttpError(404, LOAD_NOT_FOUND_BY_ID);
    }

    return foundLoad;
  }

  async save(loadDto) {
    const newLoad = await Load.create(loadDto);
    return newLoad.addLog('Load created');
  }

  remove(load) {
    if (load.status !== NEW) {
      throw new HttpError(409, CANNOT_EDIT_NOT_NEW_LOAD);
    }

    return Load.findByIdAndDelete(load);
  }

  async update(load, editedLoadData) {
    if (load.status !== NEW) {
      throw new HttpError(409, CANNOT_EDIT_NOT_NEW_LOAD);
    }

    await Load.findByIdAndUpdate(load, editedLoadData);
    return this.findById(load);
  }

  updateLoadStatus(load, newStatus) {
    load.status = newStatus;
    return load.addLog(`Changed status to ${newStatus}`);
  }

  async connectTruckAndLoad(truck, load) {
    if (load.status === NEW) {
      await this.updateLoadStatus(load, POSTED);
    }

    await truck.update({status: OL});
    const assignedDriverId = truck.assignedTo;

    await driverService.assignLoad(assignedDriverId, load._id);
    await this.updateLoadStatus(load, ASSIGNED);
    await this.performLoadStateChange(load, ROUTE_TO_PICK_UP);
  }
  async processPostedLoad(postedLoad) {
    const foundTruck = await truckService.findTruckForLoad(postedLoad);

    if (!foundTruck) {
      await this.updateLoadStatus(postedLoad, NEW);
    } else {
      await this.connectTruckAndLoad(foundTruck, postedLoad);
    }

    return Load.findById(postedLoad);
  }

  async createLoad(loadDto) {
    const newLoad = await this.save(loadDto);
    return this.updateLoadStatus(newLoad, NEW);
  }

  async postLoadById(loadId) {
    const load = await this.findById(loadId);

    if (load.status !== NEW) {
      throw new HttpError(409, CANNOT_POST_NOT_NEW_LOAD);
    }

    await this.updateLoadStatus(load, POSTED);
    return this.processPostedLoad(load);
  }

  async finishDelivery(load) {
    const updatedLoad = await this.updateLoadStatus(load, SHIPPED);

    const populatedLoad =
        await updatedLoad.populate('assignedTo').execPopulate();
    const assignedDriver = populatedLoad.assignedTo;

    // TODO: Not sure if I need to save connection between driver
    // and load after successful shipment
    // await populatedLoad.update({$unset: {assignedTo: 1}});

    await assignedDriver.update({$unset: {assignedLoad: 1}});

    const truckId = assignedDriver.truck;

    await Truck.findByIdAndUpdate(truckId, {status: IS});
  }

  hasUserAuthorityForLoad(user, load) {
    switch (user.role) {
      case DRIVER:
        return load.equals(user.assignedLoad);
      case SHIPPER:
        return user.equals(load.createdBy);
      default:
        throw new HttpError(403, USER_LACKS_AUTHORITY);
    }
  }

  async performLoadStateChange(load) {
    const newState = this.getNextLoadState(load);
    const updatedLoad =
        await Load.findByIdAndUpdate(load._id, {state: newState});
    await updatedLoad.addLog(`Change load state to: ${newState}`);

    if (newState === ARRIVED_TO_DELIVERY) {
      await this.finishDelivery(load);
    }

    return Load.findById(load._id);
  }

  async findLoadForTruck(truck) {
    /**
     *  Finds suitable load which was created first - so it works like a queue
     *  (FIFO)
     */
    const foundLoads = await Load.aggregate([
      {
        $match: {
          'status': NEW,
          'dimensions.width': {$lte: truck.dimensions.width},
          'dimensions.length': {$lte: truck.dimensions.length},
          'dimensions.height': {$lte: truck.dimensions.height},
          'payload': {$lte: truck.maxPayload},
        },
      },
      {
        $project: {
          'createdAt': {$arrayElemAt: ['$logs.time', 0]},
        },
      },
      {
        $sort: {'createdAt': 1},
      },
      {
        $limit: 1,
      },
    ]);

    // Rehydrate the load doc
    return foundLoads.length > 0 ? this.findById(foundLoads[0]._id) : null;
  }

  getNextLoadState(load) {
    const statesTuple = [
      ROUTE_TO_PICK_UP,
      ARRIVED_TO_PICK_UP,
      ROUTE_TO_DELIVERY,
      ARRIVED_TO_DELIVERY,
    ];
    const currentStateIdx = statesTuple.indexOf(load.state);

    if (currentStateIdx === load.length - 1) {
      throw new HttpError(400, CANNOT_CHANGE_ARRIVED_LOAD_STATE);
    }

    return statesTuple[currentStateIdx + 1];
  }

  async getLoadsForRole(user, match, options) {
    switch (user.role) {
      case DRIVER:
        return [await driverService.getAssignedDriverLoad(user)];
      case SHIPPER:
        return this.findByCreatedUserId(user._id, match, options);
    }
  }

  convertLoadEntityToLoadResponseDto(loadEntity) {
    return {
      '_id': loadEntity._id,
      'assigned_to': loadEntity.assignedTo,
      'created_by': loadEntity.createdBy,
      'status': loadEntity.status,
      'state': loadEntity.state,
      'logs': loadEntity.logs
          .map((log) => ({
            message: log.message,
            time: moment(log.time).format('X'),
          })),
      'payload': loadEntity.payload,
      'dimensions': loadEntity.dimensions,
    };
  }

  convertEntityListToResponseDtoList(loadEntityList) {
    return loadEntityList
        .map((loadEntity) => {
          return this.convertLoadEntityToLoadResponseDto(loadEntity);
        });
  }
}

module.exports = new LoadService();