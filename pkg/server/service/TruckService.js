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

const Truck = require('../model/truck.model');
const {
  CANNOT_CHANGE_DATA_OL,
  CANNOT_CHANGE_DATA_ASSIGNED_TRUCK,
  TRUCK_NOT_FOUND_BY_ID,
  USER_LACKS_AUTHORITY,
} = require('../constants/errors');
const {IS} = require('../constants/truckStatuses');
const HttpError = require('../utils/HttpError');

class TruckService {
  findAll() {
    return Truck.find();
  }

  findByCreatedUserId(userId) {
    return Truck.find({createdBy: userId});
  }

  async findById(id) {
    const foundTruck = await Truck.findById(id);

    if (!foundTruck) {
      throw new HttpError(404, TRUCK_NOT_FOUND_BY_ID);
    }

    return foundTruck;
  }

  save(truckDto) {
    truckDto.status = IS;
    const newTruck = Truck.create(truckDto);
    return newTruck;
  }

  async remove(truck) {
    await this.checkTruckCanBeModified(truck);
    return Truck.findByIdAndDelete(truck);
  }

  async updateById(id, editedTruckData) {
    const truck = await Truck.findById(id).populate('createdBy');
    await this.checkTruckCanBeModified(truck);

    await truck.update(editedTruckData).exec();
    // This is done to trigger 'save' middleware
    const updTruck = await Truck.findById(truck);
    await updTruck.save();

    return updTruck;
  }

  async findTruckForLoad(load) {
    /** The aggregate function finds ALL unassigned trucks, and then filters
     *  them. In case of real application, without pre-defined truck sizes,
     *  I would leave it. But in our case, we could have matched load size and
     *  weight against truck types (we have only 3 of them), and if the payload
     *  could be carried only by largest truck, we can start our search on them,
     *  which would be more efficient.
     *
     *  Returns smallest possible truck for given load.
     */
    const foundTrucks = await Truck.aggregate([
      {
        $match: {
          'status': IS,
          'assignedTo': {$exists: true},
          'dimensions.width': {$gte: load.dimensions.width},
          'dimensions.length': {$gte: load.dimensions.length},
          'dimensions.height': {$gte: load.dimensions.height},
          'maxPayload': {$gte: load.payload},
        },
      },
      {
        $project: {
          capacityIndex: {
            $multiply: [
              '$dimensions.length',
              '$dimensions.height',
              '$dimensions.width',
              '$maxPayload',
            ],
          },
        },
      },
      {
        $sort: {capacityIndex: 1},
      },
      {
        $limit: 1,
      },
    ]);

    // the truck is found again to ensure its methods - to cast it to document
    return foundTrucks.length > 0 ? this.findById(foundTrucks[0]._id) : null;
  }

  isTruckAvailableForWork(truck) {
    return truck.status === IS && !!truck.assignedTo;
  }

  checkDriverReadWriteRights(driver, truck) {
    if (!driver.equals(truck.createdBy)) {
      throw new HttpError(403, USER_LACKS_AUTHORITY);
    }
  }

  async checkTruckCanBeModified(truck) {
    const populatedTruck = await truck.populate('createdBy').execPopulate();
    const truckOwner = populatedTruck.createdBy;

    if (truckOwner.assignedLoad) {
      throw new HttpError(409, CANNOT_CHANGE_DATA_OL);
    }
    if (populatedTruck.assignedTo) {
      throw new HttpError(409, CANNOT_CHANGE_DATA_ASSIGNED_TRUCK);
    }
  }

  async unassignDriverFromTruck(truckId) {
    return Truck.findByIdAndUpdate(truckId, {$unset: {assignedTo: ''}});
  }

  convertTruckEntityToTruckResponseDto(truckEntity) {
    return {
      '_id': truckEntity._id,
      'assigned_to': truckEntity.assignedTo,
      'created_by': truckEntity.createdBy,
      'status': truckEntity.status,
      'maxPayload': truckEntity.maxPayload,
      'dimensions': truckEntity.dimensions,
    };
  }

  convertEntityListToResponseDtoList(truckEntityList) {
    return truckEntityList
        .map((truckEntity) => {
          return this.convertTruckEntityToTruckResponseDto(truckEntity);
        });
  }
}

module.exports = new TruckService();