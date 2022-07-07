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

const express = require('express');
const router = express.Router();
const weatherService = require('./../../service/WeatherService');
const {SUCCESS} = require('../../constants/responseStatuses');
const validateGetWeatherForCity =
  require('./../validation/weather/getWeatherForCity');

/**
 * @api {get} api/weather Get weather for city
 * @apiName GetWeather
 * @apiGroup Weather
 *
 * @apiParam {String} city city for request
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "status": "SUCCESS",
 *        "weatherData": {
 *            "coord": {
 *                "lon": -0.13,
 *                "lat": 51.51
 *            },
 *            "weather": [
 *                {
 *                    "id": 800,
 *                    "main": "Clear",
 *                    "description": "clear sky",
 *                    "icon": "01d"
 *                }
 *            ],
 *            "base": "stations",
 *            "main": {
 *                "temp": 290.09,
 *                "feels_like": 282.1,
 *                "temp_min": 288.71,
 *                "temp_max": 290.93,
 *                "pressure": 1019,
 *                "humidity": 33
 *            },
 *            "visibility": 10000,
 *            "wind": {
 *                "speed": 8.7,
 *                "deg": 90
 *            },
 *            "clouds": {
 *                "all": 0
 *            },
 *            "dt": 1587309286,
 *            "sys": {
 *                "type": 1,
 *                "id": 1414,
 *                "country": "IN",
 *                "sunrise": 1587272119,
 *                "sunset": 1587323004
 *            },
 *            "timezone": 3600,
 *            "id": 2643743,
 *            "name": "Arrah",
 *            "cod": 200
 *        }
 *    }
 *
 */
router.get('/', validateGetWeatherForCity, async (req, res, next) => {
  const {city} = req.query;

  try {
    const weatherData = await weatherService.getWeatherByCity(city);

    res.json({status: SUCCESS, weatherData});
  } catch (err) {
    next(err);
  }
});

module.exports = router;