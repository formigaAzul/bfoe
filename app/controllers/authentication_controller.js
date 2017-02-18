// Copyright (C) 2016 Spelltwine Games. All rights reserved.
// This code can only be used under the standard Unity Asset Store End User License Agreement,
// a copy of which is available at http://unity3d.com/company/legal/as_terms.

'use strict';

var mongoose = require('mongoose');
var passport = require('passport');
var User = mongoose.model('User');

var sendJSONResponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.register = function (req, res) {
    // Check if all the required fields are present.
    if (!req.body.name || !req.body.email || !req.body.password) {
        sendJSONResponse(res, 400, {
            'status': 'error',
            'message': 'All fields are required.'
        });
        return;
    }

    // Check if a user with the same email already exists.
    User.findOne({ email: req.body.email }, function (err, user) {
        if (user != null) {
            sendJSONResponse(res, 400, {
                'status': 'error',
                'message': 'This email is already registered.'
            });
            return;
        }
        else {
            // Check if a user with the same name already exists.
            User.findOne({ name: req.body.name }, function (err, user) {
                if (user != null) {
                    sendJSONResponse(res, 400, {
                        'status': 'error',
                        'message': 'This name is already registered.'
                    });
                    return;
                } else {
                    // Create a new user.
                    var user = new User();
                    user.name = req.body.name;
                    user.email = req.body.email;
                    user.setPassword(req.body.password);

                    // Save the new user to the database.
                    user.save(function (err) {
                        var token;
                        if (err) {
                            sendJSONResponse(res, 404, {
                                'status': 'error',
                                'message': 'Server error.'
                            });
                            return;
                        } else {
                            token = user.generateJWT();
                            sendJSONResponse(res, 200, {
                                'status': 'success',
                                'token': token
                            });
                        }
                    });
                }
            });
        }
    });
};

module.exports.login = function (req, res) {
    // Check all the required fields are present.
    if (!req.body.email || !req.body.password) {
        sendJSONResponse(res, 400, {
            'status': 'error',
            'message': 'All fields are required.'
        });
        return;
    }

    // Authenticate the user via Passport.
    passport.authenticate('local', function (err, user, info) {
        var token;

        if (err) {
            sendJSONResponse(res, 404, {
                'status': 'error',
                'message': 'Server error.'
            });
            return;
        }

        if (user) {
            token = user.generateJWT();
            sendJSONResponse(res, 200, {
                'status': 'success',
                'token': token,
                'username': user.name,
                'numUnopenedCardPacks': user.numUnopenedCardPacks,
                'currency': user.currency
            });
        } else {
            sendJSONResponse(res, 401, {
                'status': 'error',
                'message': 'Invalid credentials.'
            });
        }
    })(req, res);
};
