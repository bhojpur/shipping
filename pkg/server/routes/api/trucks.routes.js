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

const truckService = require('../../service/TruckService');
const {
  TRUCK_REMOVED_SUCCESSFULLY,
  TRUCK_ASSIGNED,
  TRUCK_CREATED,
  TRUCK_EDITED_SUCCESSFULLY,
} = require('../../constants/responseStatuses');
const truckTypesMap = require('../../constants/truckTypesMap');
const driverService = require('../../service/DriverService');
const {isValidObjectId} = require('../../utils/isValidObjectId');
const HttpError = require('../../utils/HttpError');
const {
  WRONG_ID_FORMAT,
} = require('../../constants/errors');
const validateCreateOrEditTruck =
  require('../validation/trucks/validateCreateOrEditTruck');

const express = require('express');
const router = express.Router();

/**
 * @apiDefine WrongRequestFormat
 *
 * @apiError (400) WrongRequestFormat Request payload has wrong format
 */

/**
 * @apiDefine TruckNotFound
 *
 * @apiError (404) LoadNotFound Cannot find load with given <code>id</code>
 */

/**
 * @apiDefine NoPermission
 *
 * @apiError (401) NoPermission User lacks permission
 */


router.param('id', async (req, res, next) => {
  const {id} = req.params;
  if (!isValidObjectId(id)) {
    return next(new HttpError(404, WRONG_ID_FORMAT));
  }
  const driver = req.user;

  try {
    req.truck = await truckService.findById(id);
    truckService.checkDriverReadWriteRights(driver, req.truck);
    next();
  } catch (err) {
    return next(err);
  }
});

/**
 * @api {get} api/trucks Retrieve list of trucks (for this driver).
 * @apiName GetTrucks
 * @apiGroup Truck
 *
 * @apiPermission driver
 *
 * @apiUse AuthHeader
 *
 * @apiSuccess (200) {Object[]} trucks Trucks created by current Driver.
 * @apiSuccess (200) {String} truck._id truck unique id
 * @apiSuccess (200) {String} [truck.assigned_to] unique id of
 * driver who has this truck assigned
 * @apiSuccess (200) {String} load.created_by unique id of
 * driver who created this truck
 * @apiSuccess (200) {String} truck.status truck status
 * @apiSuccess (200) {Number} truck.maxPayload truck maximum payload
 * @apiSuccess (200) {Object} truck.dimensions truck dimensions object
 * @apiSuccess (200) {Number} truck.dimensions.width truck width
 * @apiSuccess (200) {Number} truck.dimensions.height truck height
 * @apiSuccess (200) {Number} truck.dimensions.length truck length
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "trucks": [
 *        {
 *            "_id": "5e8ddf6bc0157f32f40ab292",
 *            "assigned_to": "5e8dc5726c0040313c3cb6ee",
 *            "created_by": "5e8dc5726c0040313c3cb6ee",
 *            "status": "IN SERVICE",
 *            "maxPayload": 4000,
 *            "dimensions": {
 *                "width": 350,
 *                "height": 200,
 *                "length": 700
 *            }
 *        },
 *        {
 *            "_id": "5e8ddf9c41cd264ef439c508",
 *            "created_by": "5e8dc5726c0040313c3cb6ee",
 *            "status": "IN SERVICE",
 *            "maxPayload": 1200,
 *            "dimensions": {
 *                "width": 250,
 *                "height": 170,
 *                "length": 300
 *            }
 *        }
 *      ]
 *     }
 */
router.get('/', async (req, res) => {
  const userId = req.user._id;
  const truckEntityList = await truckService.findByCreatedUserId(userId);
  const truckResponseDtoList =
    truckService.convertEntityListToResponseDtoList(truckEntityList);

  res.json({trucks: truckResponseDtoList});
});

/**
 * @api {get} api/trucks/:id Get truck with given id.
 * @apiName GetTruckById
 * @apiGroup Truck
 *
 * @apiPermission driver
 *
 * @apiUse AuthHeader
 *
 * @apiParam {String} id truck unique <code>id</code>
 *
 * @apiSuccess (200) {String} truck._id truck unique id
 * @apiSuccess (200) {String} [truck.assigned_to] unique id of
 * driver who has this truck assigned
 * @apiSuccess (200) {String} load.created_by unique id of
 * driver who created this truck
 * @apiSuccess (200) {String} truck.status truck status
 * @apiSuccess (200) {Number} truck.maxPayload truck maximum payload
 * @apiSuccess (200) {Object} truck.dimensions truck dimensions object
 * @apiSuccess (200) {Number} truck.dimensions.width truck width
 * @apiSuccess (200) {Number} truck.dimensions.height truck height
 * @apiSuccess (200) {Number} truck.dimensions.length truck length
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "_id": "5e8ddf6bc0157f32f40ab292",
 *        "assigned_to": "5e8dc5726c0040313c3cb6ee",
 *        "created_by": "5e8dc5726c0040313c3cb6ee",
 *        "status": "IN SERVICE",
 *        "maxPayload": 4000,
 *        "dimensions": {
 *            "width": 350,
 *            "height": 200,
 *            "length": 700
 *        }
 *     }
 */
router.get('/:id', (req, res) => {
  const truckResponseDto =
    truckService.convertTruckEntityToTruckResponseDto(req.truck);

  res.json(truckResponseDto);
});

/**
 * @api {post} api/trucks Create new truck - using pre-defined type
 * @apiName PostTruck - using type
 * @apiGroup Truck
 *
 * @apiPermission driver
 *
 * @apiUse AuthHeader
 *
 * @apiParam {String} type - truck type = SPRINTER | SMALL_STRAIGHT |
 * LARGE_STRAIGHT
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "type": "SPRINTER"
 *     }
 *
 * @apiSuccess (200) {String} status Response status text
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "status": "Truck created successfully"
 *     }
 */

/**
 * @api {post} api/trucks Create new truck - using custom truck params
 * @apiName PostTruck - using custom params
 * @apiGroup Truck
 *
 * @apiPermission driver
 *
 * @apiUse AuthHeader
 *
 * @apiParam {Number} truck.maxPayload truck maximum payload
 * @apiParam {Object} truck.dimensions truck dimensions object
 * @apiParam {Number} truck.dimensions.width truck width
 * @apiParam {Number} truck.dimensions.height truck height
 * @apiParam {Number} truck.dimensions.length truck length
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *        "maxPayload": 1250,
 *        "dimensions": {
 *            "width": 170,
 *            "height": 155,
 *            "length": 342
 *        }
 *     }
 *
 * @apiSuccess (200) {String} status Response status text
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "status": "Truck created successfully"
 *     }
 */
router.post('/', validateCreateOrEditTruck, async (req, res, next) => {
  const truckData = truckTypesMap[req.body.type] || req.body;
  truckData.createdBy = req.user._id;
  truckData.type = req.body.type;

  try {
    await truckService.save(truckData);

    res.json({status: TRUCK_CREATED});
  } catch (err) {
    return next(err);
  }
});

/**
 * @api {delete} api/trucks/:id Delete truck by id
 * @apiName DeleteTruck
 * @apiGroup Truck
 *
 * @apiPermission driver
 *
 * @apiUse AuthHeader
 *
 * @apiParam {String} id Truck unique id
 *
 * @apiSuccess (200) {String} status Response status text
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "status": "Truck removed successfully"
 *     }
 */
router.delete('/:id', async (req, res, next) => {
  const truck = req.truck;

  try {
    await truckService.remove(truck);
  } catch (err) {
    return next(err);
  }
  res.json({status: TRUCK_REMOVED_SUCCESSFULLY});
});

/**
 * @api {put} api/trucks/:id Edit truck - using pre-defined type
 * @apiName EditTruck - using type
 * @apiGroup Truck
 *
 * @apiPermission driver
 *
 * @apiUse AuthHeader
 *
 * @apiParam {String} id Truck unique id
 * @apiParam {String} type - truck type = SPRINTER | SMALL_STRAIGHT |
 * LARGE_STRAIGHT
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "type": "SPRINTER"
 *     }
 *
 * @apiSuccess (200) {String} status Response status text
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "status": "Truck edited successfully"
 *     }
 */

/**
 * @api {put} api/trucks/:id Edit truck - using custom truck params
 * @apiName EditTruck - using custom params
 * @apiGroup Truck
 *
 * @apiPermission driver
 *
 * @apiUse AuthHeader
 *
 * @apiParam {String} id Truck unique id
 * @apiParam {Number} truck.maxPayload truck maximum payload
 * @apiParam {Object} truck.dimensions truck dimensions object
 * @apiParam {Number} truck.dimensions.width truck width
 * @apiParam {Number} truck.dimensions.height truck height
 * @apiParam {Number} truck.dimensions.length truck length
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *        "maxPayload": 1250,
 *        "dimensions": {
 *            "width": 170,
 *            "height": 155,
 *            "length": 342
 *        }
 *     }
 *
 * @apiSuccess (200) {String} status Response status text
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "status": "Truck edited successfully"
 *     }
 */
router.put('/:id', validateCreateOrEditTruck, async (req, res, next) => {
  const {id} = req.params;
  const truckDto = truckTypesMap[req.body.type] ?
    {...truckTypesMap[req.body.type], type: req.body.type} :
    req.body;

  try {
    await truckService.updateById(id, truckDto);

    res.json({status: TRUCK_EDITED_SUCCESSFULLY});
  } catch (err) {
    return next(err);
  }
});

/**
 * @api {put} api/trucks/:id/assign Assign truck to current driver
 * @apiName AssignTruck
 * @apiGroup Truck
 *
 * @apiPermission driver
 *
 * @apiUse AuthHeader
 *
 * @apiParam {String} id Truck unique id
 *
 * @apiSuccess (200) {String} status Response status text
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "status": "Truck assigned successfully"
 *     }
 */
router.patch('/:id/assign', async (req, res, next) => {
  const {id: truckId} = req.params;
  const driverId = req.user._id;

  try {
    await driverService.assignTruck(driverId, truckId);

    res.json({status: TRUCK_ASSIGNED});
  } catch (err) {
    return next(err);
  }
});


module.exports = router;