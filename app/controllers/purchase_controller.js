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

module.exports.getCurrency = function (req, res) {
    getUser(req, res, function (req, res, user) {
        sendJSONResponse(res, 200, {
            'status': 'success',
            'currency': user.currency
        });
    });
};

module.exports.setCurrency = function (req, res) {
    // Check all the required fields are present.
    if (!req.body.currency || isNaN(req.body.currency)) {
        sendJSONResponse(res, 400, {
            'status': 'error',
            'message': 'All fields are required.'
        });
        return;
    }

    if (req.body.currency < 0) {
        sendJSONResponse(res, 400, {
            'status': 'error',
            'message': 'Invalid currency.'
        });
        return;
    }

    var currency = parseInt(req.body.currency, 10);

    User.findOne({ 'email': req.payload.email }, function (err, user) {
        if (err) {
            sendJSONResponse(res, 404, {
                'status': 'error',
                'message': 'Server error.'
            });
        }
        else {
            user.currency += currency;
            user.save(function (err) {
                if (err) {
                    sendJSONResponse(res, 404, {
                        'status': 'error',
                        'message': 'Server error.'
                    });
                } else {
                    sendJSONResponse(res, 200, {
                        'status': 'success',
                        'currency': user.currency
                    });
                }
            });
        }
    });
};

module.exports.buyCardPacks = function (req, res) {
    // Check all the required fields are present.
    if (!req.body.numPacks || isNaN(req.body.numPacks)) {
        sendJSONResponse(res, 400, {
            'status': 'error',
            'message': 'All fields are required.'
        });
        return;
    }

    if (req.body.numPacks <= 0) {
        sendJSONResponse(res, 400, {
            'status': 'error',
            'message': 'Invalid number of packs.'
        });
        return;
    }

    var numPacks = parseInt(req.body.numPacks, 10);

    User.findOne({ 'email': req.payload.email }, function (err, user) {
        if (err) {
            sendJSONResponse(res, 404, {
                'status': 'error',
                'message': 'Server error.'
            });
        }
        else {
            if (user.currency < (numPacks * config.cardPackPrice)) {
                sendJSONResponse(res, 404, {
                    'status': 'error',
                    'message': 'Insufficient funds.'
                });
            } else {
                user.numUnopenedCardPacks += 1;
                user.currency -= (numPacks * config.cardPackPrice);
                user.save(function (err) {
                    if (err) {
                        sendJSONResponse(res, 404, {
                            'status': 'error',
                            'message': 'Server error.'
                        });
                    } else {
                        sendJSONResponse(res, 200, {
                            'status': 'success',
                            'numPacksBought': numPacks,
                            'numUnopenedPacks': user.numUnopenedCardPacks,
                            'currency': user.currency
                        });
                    }
                });
            }
        }
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