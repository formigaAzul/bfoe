// Copyright (C) 2016 Spelltwine Games. All rights reserved.
// This code can only be used under the standard Unity Asset Store End User License Agreement,
// a copy of which is available at http://unity3d.com/company/legal/as_terms.

'use strict';

var config = require('../config/config');
var mongoose = require('mongoose');
var passport = require('passport');
var User = mongoose.model('User');

var sendJSONResponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.reportGameWin = function (req, res) {
    if (!req.body.name) {
        sendJSONResponse(res, 400, {
            'status': 'error',
            'message': 'All fields are required.'
        });
        return;
    }

    User.findOne({ name: req.body.name }, function (err, user) {
        if (user == null) {
            sendJSONResponse(res, 400, {
                'status': 'error',
                'message': 'This user does not exist.'
            });
        } else {
            user.numGamesWon += 1;
            user.currency += config.winReward;

            // Persist the changes to the database.
            user.save(function (err) {
                if (err) {
                    sendJSONResponse(res, 404, {
                        'status': 'error',
                        'message': 'Server error.'
                    });
                } else {
                    sendJSONResponse(res, 200, {
                        'status': 'success',
                    });
                }
            });
        }
    });
};

module.exports.reportGameLoss = function (req, res) {
    if (!req.body.name) {
        sendJSONResponse(res, 400, {
            'status': 'error',
            'message': 'All fields are required.'
        });
        return;
    }

    User.findOne({ name: req.body.name }, function (err, user) {
        if (user == null) {
            sendJSONResponse(res, 400, {
                'status': 'error',
                'message': 'This user does not exist.'
            });
        } else {
            user.numGamesLost += 1;
            user.currency += config.lossReward;

            // Persist the changes to the database.
            user.save(function (err) {
                if (err) {
                    sendJSONResponse(res, 404, {
                        'status': 'error',
                        'message': 'Server error.'
                    });
                } else {
                    sendJSONResponse(res, 200, {
                        'status': 'success',
                    });
                }
            });
        }
    });
};

module.exports.ranking = function (req, res) {
    if (!req.query.numEntries || isNaN(req.query.numEntries)) {
        sendJSONResponse(res, 400, {
            'status': 'error',
            'message': 'All fields are required.'
        });
        return;
    }

    User.find({}).sort({ numGamesWon: 'descending' }).limit(parseInt(req.query.numEntries, 10)).select({ "name": 1, "numGamesWon": 1, "_id": 0 }).exec(
        function (err, users) {
            if (err) {
                sendJSONResponse(res, 400, {
                    'status': 'error',
                    'message': 'Server error.'
                });
                return;
            }

            sendJSONResponse(res, 200, {
                'status': 'success',
                'users': users
            });
        });
};

var getUser = function (req, res, callback) {
    if (req.payload && req.payload.email) {
        User.findOne({ 'email': req.payload.email }, function (err, user) {
            if (!user) {
                sendJSONResponse(res, 404, {
                    'status': 'error',
                    'message': 'User not found.'
                });
                return;
            } else if (err) {
                sendJSONResponse(res, 404, {
                    'status': 'error',
                    'message': 'Server error.'
                });
                return;
            }
            callback(req, res, user);
        });
    } else {
        sendJSONResponse(res, 404, {
            'status': 'error',
            'message': 'User not found'
        });
        return;
    }
};
