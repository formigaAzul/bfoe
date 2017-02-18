// Copyright (C) 2016 Spelltwine Games. All rights reserved.
// This code can only be used under the standard Unity Asset Store End User License Agreement,
// a copy of which is available at http://unity3d.com/company/legal/as_terms.

'use strict';

var config = {}

config.dbURI = 'mongodb://localhost/ccgkit-server';
// For security reasons, it is highly recommended you set the secret in an environment variable
// instead of directly in code like this.
config.dbSecret = 'thisIsSecret';
// Number of cards contained in a pack.
config.cardPackSize = 5;
// Price of a single card pack.
config.cardPackPrice = 150;
// Initial currency awarded to new players.
config.newPlayerCurrency = 300;
// Currency reward when winning a game.
config.winReward = 50;
// Currency reward when losing a game.
config.lossReward = 25;
// Default card collection.
config.defaultCardCollection = {
	0: 3,
	1: 3,
 	2: 2,
 	3: 2,
 	4: 1,
 	5: 1,
 	6: 1,
 	7: 2,
 	8: 1,
 	9: 2,
 	10: 1,
 	11: 1,
 	12: 2,
 	13: 2,
 	14: 2
};

module.exports = config;
