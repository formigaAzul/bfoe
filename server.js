// Copyright (C) 2016 Spelltwine Games. All rights reserved.
// This code can only be used under the standard Unity Asset Store End User License Agreement,
// a copy of which is available at http://unity3d.com/company/legal/as_terms.

'use strict';

var bodyParser = require('body-parser');
var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var passport = require('passport');

require('./app/db/db');
require('./app/config/passport');

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(passport.initialize());

app.get('/', function (req, res) {
    res.send({ message: 'Welcome to the CCG Kit API!' });
});

var port = process.env.PORT || 8080;
app.listen(port);

var authenticationRoutes = require('./app/routes/authentication_routes');
var cardCollectionRoutes = require('./app/routes/card_collection_routes');
var purchaseRoutes = require('./app/routes/purchase_routes');
var rankingRoutes = require('./app/routes/ranking_routes');
app.use('/api', authenticationRoutes);
app.use('/api', cardCollectionRoutes);
app.use('/api', purchaseRoutes);
app.use('/api', rankingRoutes);

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401);
        res.json({
            "message": err.name + ": " + err.message
        });
    }
});
