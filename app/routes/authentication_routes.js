// Copyright (C) 2016 Spelltwine Games. All rights reserved.
// This code can only be used under the standard Unity Asset Store End User License Agreement,
// a copy of which is available at http://unity3d.com/company/legal/as_terms.

'use strict';

var express = require('express');

var authController = require('../controllers/authentication_controller');

var router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;