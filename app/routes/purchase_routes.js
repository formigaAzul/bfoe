// Copyright (C) 2016 Spelltwine Games. All rights reserved.
// This code can only be used under the standard Unity Asset Store End User License Agreement,
// a copy of which is available at http://unity3d.com/company/legal/as_terms.

'use strict';

var config = require('../config/config');
var express = require('express');
var jwt = require('express-jwt');

var purchaseController = require('../controllers/purchase_controller');

var router = express.Router();
var auth = jwt({
    secret: config.dbSecret,
    userProperty: 'payload'
});
router.get('/getCurrency', auth, purchaseController.getCurrency);
router.post('/setCurrency', auth, purchaseController.setCurrency);
router.post('/buyCardPacks', auth, purchaseController.buyCardPacks);

module.exports = router;