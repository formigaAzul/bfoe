// Copyright (C) 2016 Spelltwine Games. All rights reserved.
// This code can only be used under the standard Unity Asset Store End User License Agreement,
// a copy of which is available at http://unity3d.com/company/legal/as_terms.

'use strict';

var config = require('../config/config');
var fs = require('fs');
var mongoose = require('mongoose');
var passport = require('passport');
var utils = require('../utils/utils');
var User = mongoose.model('User');

var sendJSONResponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.getCardCollection = function (req, res) {
    getUser(req, res, function (req, res, user) {
        var cardCollection = [];
        for (var cardId in user.cardCollection) {
            var card = {};
            card.id = cardId;
            card.numCopies = user.cardCollection[cardId];
            cardCollection.push(card);
        }
        sendJSONResponse(res, 200, {
            'status': 'success',
            'cards': cardCollection
        });
    });
};

module.exports.openCardPack = function (req, res) {
    getUser(req, res, function (req, res, user) {
        // Check if the user actually has unopened card packs.
        if (user.numUnopenedCardPacks <= 0) {
            sendJSONResponse(res, 400, {
                'status': 'error',
                'message': 'This user has no card packs left to open.'
            });
            return;
        }
            
        // Read the card rarities file.
        fs.readFile('card_rarities.json', 'utf8', function(err, data) {
            if (err) {
                sendJSONResponse(res, 404, {
                    'status': 'error',
                    'message': 'Server error.'
                });
                return;
            }

            var raritiesJSON = JSON.parse(data);
            var rarities = [];
            for (var i = 0; i < raritiesJSON.length; i++) {
                var rarity = raritiesJSON[i];
                rarities.push({
                    name: rarity.Name,
                    chance: rarity.Chance
                });
            }

            var rarityPool = [];
            for (var i = 0; i < rarities.length; i++) {
                var rarity = rarities[i];
                for (var j = 0; j < rarity.chance; j++) {
                    rarityPool.push(rarity.name);
                }
            }

            // Read the card collection file.
            fs.readFile('card_collection.json', 'utf8', function (err, data) {
                if (err) {
                    sendJSONResponse(res, 404, {
                        'status': 'error',
                        'message': 'Server error.'
                    });
                    return;
                }

                // Group the available cards by rarity.
                var cardCollection = []
                for (var i = 0; i < rarities.length; i++) {
                    var rarity = rarities[i];
                    cardCollection[rarity.name] = []
                }

                var cardCollectionJSON = JSON.parse(data);
                for (var i = 0; i < cardCollectionJSON.length; i++) {
                    var cardSet = cardCollectionJSON[i];
                    var cards = cardSet.Cards;
                    for (var j = 0; j < cards.length; j++) {
                        var card = cards[j];
                        cardCollection[card.Rarity].push(card.Id);
                    }
                }

                for (var i = 0; i < rarities.length; i++) {
                    var rarity = rarities[i];
                    utils.shuffle(cardCollection[rarity.name]);
                }

                utils.shuffle(rarityPool);

                // Randomly generate the contents of the card pack.
                var cardIds = [];
                for (var i = 0; i < config.cardPackSize; i++) {
                    var selectedRarity = rarityPool[i];
                    var selectedCard = cardCollection[selectedRarity][0];
                    cardIds.push(selectedCard);
                    utils.rotate(cardCollection[selectedRarity]);
                }

                 // Update the user's card collection.
                for (var i = 0; i < cardIds.length; i++) {
                    if (user.cardCollection[cardIds[i]])
                        user.cardCollection[cardIds[i]] += 1;
                    else
                        user.cardCollection[cardIds[i]] = 1;
                }
                user.markModified('cardCollection');
                // Decrease the number of unopened card packs for this user.
                user.numUnopenedCardPacks -= 1;

                // Persist the changes in the database.
                user.save(function (err) {
                    if (err) {
                        sendJSONResponse(res, 404, {
                            'status': 'error',
                            'message': 'Server error.'
                        });
                    } else {
                        sendJSONResponse(res, 200, {
                            'status': 'success',
                            'cards': cardIds,
                            'numUnopenedPacks': user.numUnopenedCardPacks
                        });
                    }
                });
            });
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
