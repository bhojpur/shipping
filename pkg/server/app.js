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
const app = express();
const morgan = require('morgan');
const winston = require('./config/winston');
const {errors} = require('celebrate');
const config = require('config');
const trucksRouter = require('./routes/api/trucks.routes');
const authRouter = require('./routes/api/auth.routes');
const loadsRouter = require('./routes/api/load.routes');
const meRouter = require('./routes/api/me.routes');
const usersRouter = require('./routes/api/users.routes');
const weatherRouter = require('./routes/api/weather.routes');
const authMiddleware = require('./routes/middleware/auth');
const errorHandler = require('./routes/middleware/errorHandler');
const requireRole = require('./routes/middleware/requireUserRole');
const mongoose = require('mongoose');
const {DRIVER, SHIPPER} = require('./constants/userRoles');
const cors = require('cors');

const mongoUrl = config.get('mongoUrl');
mongoose.connect(mongoUrl, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('open', console.log.bind(console, 'MongoDB connected successfully'));

app.use(cors());
app.use(morgan('combined', {stream: winston.stream}));
app.use(express.json());
const port = config.get('appPort');

app.get('/', (req, res) => {
  res.json({status: 'ok'});
});

app.use('/api/auth', authRouter);
app.use('/api/weather', weatherRouter);

app.use(authMiddleware);
app.use('/api/users', usersRouter);
app.use('/api/me', meRouter);
app.use('/api/trucks', requireRole(DRIVER), trucksRouter);
app.use('/api/loads', requireRole([DRIVER, SHIPPER]), loadsRouter);

app.use(errors());
app.use(errorHandler);
app.listen(port, () => {
  console.log('Bhojpur Shipping server is listening on port %o', port);
});