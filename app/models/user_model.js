// Copyright (C) 2016 Spelltwine Games. All rights reserved.
// This code can only be used under the standard Unity Asset Store End User License Agreement,
// a copy of which is available at http://unity3d.com/company/legal/as_terms.

'use strict';

var config = require('../config/config');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        unique: true,
        required: true
    },
    hash: String,
    salt: String,

    cardCollection: {
        type: {},
        "default": config.defaultCardCollection
    },

    numUnopenedCardPacks: {
        type: Number,
        required: true,
        "default": 0
    },

    currency: {
        type: Number,
        required: true,
        "default": config.newPlayerCurrency
    },

    numGamesWon: {
        type: Number,
        required: true,
        "default": 0
    },

    numGamesLost: {
        type: Number,
        required: true,
        "default": 0
    }
});

userSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

userSchema.methods.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    return this.hash === hash;
};

userSchema.methods.generateJWT = function () {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    return jwt.sign({
        _id: this._id,
        email: this.email,
        name: this.name,
        exp: parseInt(expiry.getTime() / 1000)
    }, config.dbSecret);
};

module.exports = [
    mongoose.model('User', userSchema)
];
