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

const {SHIPPER, DRIVER} = require('../../constants/userRoles');
const loadService = require('../../service/LoadService');
const express = require('express');
const {
  USER_LACKS_AUTHORITY,
  WRONG_ID_FORMAT,
} = require('../../constants/errors');
const requireRole = require('../middleware/requireUserRole');
const validateGetLoads = require('../validation/load/getLoads');
const validateCreateOrEditLoad =
  require('../validation/load/validateCreateOrEditLoad');
const {isValidObjectId} = require('../../utils/isValidObjectId');
const HttpError = require('../../utils/HttpError');
const router = express.Router();
const {
  LOAD_STATE_CHANGED,
  LOAD_CREATED,
  SUCCESS,
  LOAD_POSTED,
  NO_DRIVERS_FOUND,
  LOAD_EDITED,
  LOAD_REMOVED,
} = require('../../constants/responseStatuses');

/**
 * @apiDefine WrongRequestFormat
 *
 * @apiError (400) WrongRequestFormat Request payload has wrong format
 */

/**
 * @apiDefine LoadNotFound
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
  const shipper = req.user;

  try {
    req.load = await loadService.findById(id);
    if (!loadService.hasUserAuthorityForLoad(shipper, req.load)) {
      return res.status(403).json({error: USER_LACKS_AUTHORITY});
    }
    next();
  } catch (err) {
    return next(err);
  }
});

/**
 * @api {get} api/loads Retrieve list of loads (for this shipper).
 * @apiName GetLoads
 * @apiGroup Load
 *
 * @apiPermission shipper
 *
 * @apiUse AuthHeader
 *
 * @apiParam {Number} [pageNo=1] Page number (used for pagination of results)
 * @apiParam {Number} [size] Number of results per page
 * @apiParam {String} [state] Load state
 *
 * @apiSuccess (200) {String} status response status text
 * @apiSuccess (200) {Object[]} loads Loads created by current Shipper
 * @apiSuccess (200) {String} load._id load unique id
 * @apiSuccess (200) {String} [load.assigned_to] unique id of
 * driver who has this load assigned
 * @apiSuccess (200) {String} load.created_by unique id of
 * shipper who created this load
 * @apiSuccess (200) {String} load.status load status
 * @apiSuccess (200) {String} load.state load state
 * @apiSuccess (200) {Number} load.payload load payload
 * @apiSuccess (200) {Object} load.dimensions load dimensions object
 * @apiSuccess (200) {Number} load.dimensions.width load width
 * @apiSuccess (200) {Number} load.dimensions.height load height
 * @apiSuccess (200) {Number} load.dimensions.length load length
 * @apiSuccess (200) {Object[]} logs array of history logs
 * @apiSuccess (200) {String} log.message log message
 * @apiSuccess (200) {Number} log.time log timestamp
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "status": "SUCCESS",
 *        "loads": [
 *            {
 *                "_id": "5e8dc5e96c0040313c3cb6f5",
 *                "assigned_to": "5e8dc5726c0040313c3cb6ee",
 *                "created_by": "5e8dc5786c0040313c3cb6f0",
 *                "status": "SHIPPED",
 *                "state": "Arrived to Delivery",
 *                "logs": [
 *                    {
 *                        "message": "Load created",
 *                        "time": "1586349545"
 *                    },
 *                    {
 *                        "message": "Changed status to NEW",
 *                        "time": "1586349545"
 *                    },
 *                    {
 *                        "message": "Changed status to POSTED",
 *                        "time": "1586355412"
 *                    },
 *                    {
 *                        "message": "Changed status to NEW",
 *                        "time": "1586355413"
 *                    },
 *                    {
 *                        "message": "Changed status to POSTED",
 *                        "time": "1586357753"
 *                    },
 *                    {
 *                        "message": "Assigned to driver with id: 5e8dc5726c0040313c3cb6ee",
 *                        "time": "1586357753"
 *                    },
 *                    {
 *                        "message": "Changed status to ASSIGNED",
 *                        "time": "1586357753"
 *                    },
 *                    {
 *                        "message": "Change load state to: En Route to Pick Up",
 *                        "time": "1586357753"
 *                    },
 *                    {
 *                        "message": "Change load state to: Arrived to Pick Up",
 *                        "time": "1586359395"
 *                    },
 *                    {
 *                        "message": "Change load state to: En Route to Delivery",
 *                        "time": "1586359445"
 *                    },
 *                    {
 *                        "message": "Change load state to: Arrived to Delivery",
 *                        "time": "1586359456"
 *                    },
 *                    {
 *                        "message": "Changed status to SHIPPED",
 *                        "time": "1586359456"
 *                    }
 *                ],
 *                "payload": 100,
 *                "dimensions": {
 *                    "width": 25,
 *                    "height": 45,
 *                    "length": 30
 *                }
 *            },
 *            {
 *                "_id": "5e8dc61bf5bd45190024ea29",
 *                "created_by": "5e8dc5786c0040313c3cb6f0",
 *                "status": "NEW",
 *                "logs": [
 *                    {
 *                        "message": "Load created",
 *                        "time": "1586349595"
 *                    },
 *                    {
 *                        "message": "Changed status to NEW",
 *                        "time": "1586349595"
 *                    }
 *                ],
 *                "payload": 100,
 *                "dimensions": {
 *                    "width": 111,
 *                    "height": 45,
 *                    "length": 30
 *                }
 *            },
 *        ]
 *    }
 */
router.get('/', validateGetLoads, async (req, res, next) => {
  const match = {
    status: req.query.status,
  };

  const pageNo = parseInt(req.query.pageNo) || 1;
  const size = parseInt(req.query.size) || 0;
  const options = {
    limit: size,
    skip: size * (pageNo - 1),
  };
  try {
    const loadEntityList =
      await loadService.getLoadsForRole(req.user, match, options);
    const loadResponseDtoList =
      loadService.convertEntityListToResponseDtoList(loadEntityList);

    res.json({status: SUCCESS, loads: loadResponseDtoList});
  } catch (err) {
    next(err);
  }
});

/**
 * @api {get} api/loads/:id Retrieve load by id
 * @apiName GetLoadById
 * @apiGroup Load
 *
 * @apiPermission shipper, driver
 *
 * @apiUse AuthHeader
 *
 * @apiParam {String} id Load unique id
 *
 * @apiSuccess (200) {String} status response status.
 * @apiSuccess (200) {Object} load Load with given id
 * @apiSuccess (200) {String} load._id load unique id
 * @apiSuccess (200) {String} [load.assigned_to] unique id of
 * driver who has this load assigned
 * @apiSuccess (200) {String} load.created_by unique id of
 * shipper who has created this load
 * @apiSuccess (200) {String} load.status load status
 * @apiSuccess (200) {String} load.state load state
 * @apiSuccess (200) {Number} load.payload load payload
 * @apiSuccess (200) {Object} load.dimensions load dimensions object
 * @apiSuccess (200) {Number} load.dimensions.width load width
 * @apiSuccess (200) {Number} load.dimensions.height load height
 * @apiSuccess (200) {Number} load.dimensions.length load length
 * @apiSuccess (200) {Object[]} logs array of history logs
 * @apiSuccess (200) {String} log.message log message
 * @apiSuccess (200) {Number} log.time log timestamp
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *       {
 *          "status": "SUCCESS",
 *          "load": {
 *              "_id": "5e8dc61bf5bd45190024ea29",
 *              "created_by": "5e8dc5786c0040313c3cb6f0",
 *              "status": "NEW",
 *              "logs": [
 *                  {
 *                      "message": "Load created",
 *                      "time": "1586349595"
 *                  },
 *                  {
 *                      "message": "Changed status to NEW",
 *                      "time": "1586349595"
 *                  }
 *              ],
 *              "payload": 100,
 *              "dimensions": {
 *                  "width": 111,
 *                  "height": 45,
 *                  "length": 30
 *              }
 *          }
 *      }
 *
 * @apiUse LoadNotFound
 * @apiUse NoPermission
 */
router.get('/:id', async (req, res) => {
  const loadResponseDto =
    loadService.convertLoadEntityToLoadResponseDto(req.load);

  res.json({status: SUCCESS, load: loadResponseDto});
});

/**
 * @api {post} api/loads Create new load
 * @apiName CreateLoad
 * @apiGroup Load
 *
 * @apiPermission shipper
 *
 * @apiUse AuthHeader
 *
 * @apiParam {Number} load.payload load payload
 * @apiParam {Object} load.dimensions load dimensions object
 * @apiParam {Number} load.dimensions.width load width
 * @apiParam {Number} load.dimensions.height load height
 * @apiParam {Number} load.dimensions.length load length
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *        "payload": 500,
 *        "dimensions": {
 *            "width": 50,
 *            "height": 75,
 *            "length": 150
 *        }
 *     }
 *
 * @apiSuccess (200) {String} status Response status text
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "status": "Load created successfully"
 *     }
 */
router.post('/',
    requireRole(SHIPPER),
    validateCreateOrEditLoad,
    async (req, res, next) => {
      const load = {
        ...req.body,
        createdBy: req.user._id,
      };

      try {
        await loadService.createLoad(load);
        res.json({status: LOAD_CREATED});
      } catch (err) {
        return next(err);
      }
    });

/**
 * @api {delete} api/loads/:id Delete load with given id
 * @apiName DeleteLoadById
 * @apiGroup Load
 *
 * @apiPermission shipper
 *
 * @apiParam {String} id Load unique id
 *
 * @apiSuccess (200) {String} status response status
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "status": "Load removed successfully"
 *     }
 *
 * @apiUse LoadNotFound
 * @apiUse NoPermission
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await loadService.remove(req.load);
    res.json({status: LOAD_REMOVED});
  } catch (err) {
    return next(err);
  }
});

/**
 * @api {put} api/loads/:id Edit load
 * @apiName EditLoad
 * @apiGroup Load
 *
 * @apiPermission shipper
 *
 * @apiParam {String} id load id
 * @apiParam {Number} load.payload load payload
 * @apiParam {Object} load.dimensions load dimensions object
 * @apiParam {Number} load.dimensions.width load width
 * @apiParam {Number} load.dimensions.height load height
 * @apiParam {Number} load.dimensions.length load length
 *
 * @apiSuccess (200) {String} status response status
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "status": "Load successfully edited"
 *     }
 * @apiUse WrongRequestFormat
 * @apiUse LoadNotFound
 * @apiUse NoPermission
 */
router.put('/:id',
    validateCreateOrEditLoad,
    async (req, res, next) => {
      const load = req.load;
      const editedLoadData = req.body;

      try {
        await loadService.update(load, editedLoadData);

        res.status(200).json({status: LOAD_EDITED});
      } catch (err) {
        return next(err);
      }
    });

/**
 * @api {patch} api/loads/:id/state Update load state
 * @apiName UpdateLoadState
 * @apiGroup Load
 *
 * @apiPermission driver
 *
 * @apiParam {String} id load id
 *
 * @apiSuccess (200) {String} status response status
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "status": "Load state changed successfully"
 *     }
 * @apiUse WrongRequestFormat
 * @apiUse LoadNotFound
 * @apiUse NoPermission
 */
router.patch('/:id/state',
    requireRole(DRIVER),
    async (req, res, next) => {
      const load = req.load;
      try {
        await loadService.performLoadStateChange(load);

        res.json({status: LOAD_STATE_CHANGED});
      } catch (err) {
        return next(err);
      }
    });

/**
 * @api {patch} api/loads/:id/post Change load status to "posted"
 * @apiName PostLoad
 * @apiGroup Load
 *
 * @apiPermission shipper
 *
 * @apiParam {String} id load id
 *
 * @apiSuccess (200) {String} status response status
 * @apiSuccess (200) {String} [assigned_to] driver id who has this load assigned
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "status": "Load posted successfully",
 *      "assigned_to": "5e8dc61bf5bd4519001d3d29"
 *     }
 * @apiUse WrongRequestFormat
 * @apiUse LoadNotFound
 * @apiUse NoPermission
 */
router.post('/:id/post', requireRole(SHIPPER), async (req, res, next) => {
  const {id} = req.params;

  try {
    const postedLoad = await loadService.postLoadById(id);
    if (!!postedLoad.assignedTo) {
      return res.json({
        status: LOAD_POSTED,
        assigned_to: postedLoad.assignedTo,
      });
    }

    res.json({status: NO_DRIVERS_FOUND});
  } catch (err) {
    return next(err);
  }
});

module.exports = router;