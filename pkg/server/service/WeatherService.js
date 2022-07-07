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

const axios = require('axios');
const config = require('config');
const {WEATHER_API} = require('../constants/externalApiLinks');
const weatherApiKey = config.get('weatherApiKey');
const HttpError = require('./../utils/HttpError');
const {CANNOT_FIND_LOCATION} = require('../constants/errors');

class WeatherService {
  getWeatherByCity(city) {
    const reqParams = {
      q: city,
      appid: weatherApiKey,
    };

    return axios
        .get(WEATHER_API, {params: reqParams})
        .then((res) => res.data)
        .catch((err) => {
          switch (err.response.status) {
            case 404:
              throw new HttpError(404, CANNOT_FIND_LOCATION);
            default:
              throw new Error(err);
          }
        });
  }
}

module.exports = new WeatherService();