/*
 * Animal AI, Copyright 2014, Timothy Rochford
 */
/*    This file is part of Animal AI.

    Animal AI is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Animal AI is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with Animal AI.  If not, see <http://www.gnu.org/licenses/>.
*/
"use strict";

var mockery = require('mockery'),
        game = require('./../routes/game.js'); // module under test

// Mongo Database object - stores values to be verified in the tests
function DatabaseObject(findResults) {
    this.testAnimals.lastUpdatedDocument = undefined;
    this.testAnimals.aggregateState = 0;
    this.testAnimals.findResults = findResults;
}

DatabaseObject.prototype = {
    testAnimals: {
        aggregate: function (array, callback) {
            if (this.aggregateState++ === 1) {
                callback(null, [{_id: "Is it a predator?", number: 2},
                                {_id: "Can it jump?", number: 2},
                                {_id: "Does it live in water?", number: 1}]);
            } else {
                callback(null, [{_id: "Does it live in water?", number: 1},
                                {_id: "Is it slimy?", number: 1}]);
            }
        },
        update : function (name, newProperties, c, callback) {
            this.lastUpdatedDocument = newProperties;
            if (arguments.length === 4) {
                callback(null, null);
            }
        },
        find: function (query, callback) {
            callback(null, this.findResults);
        }
    }
}

// Wrapper to return DatabaseObject
function MongoMockNew (dbObj) {
    this.db = dbObj;
}

MongoMockNew.prototype = {
    connect: function () { return this.db; }
}

var utilMock = {
    cookieUsageWarning: function () { return false; },
    forceRefresh: function () {},
    profanityCheck: function (animalName) { return true; }
}

var cookiePot = [];

// module scope request and response objects.
var req = { "cookies" : {
                "questionnumber":0,
                "questionsanswers": ""}
          };
var res = {
    clearCookie : function(name) { },
    cookie : function(k,v,extras) { cookiePot[k]=v;},
    render : function(page, options) {}
};

var mongo;

function commonSetup(callback) {
    mockery.registerAllowable('underscore');
    mockery.registerAllowable('util');
    mockery.registerAllowable('./../routes/game.js');
    mockery.registerMock('./../routes/utils.js', utilMock);

    mockery.enable();
    var _ = require('underscore');
    var utils = require('./../routes/utils.js');
    mongo = require('./../routes/mongo.js');
    callback();
}

function tearDown(callback) {
    // clean up
    mockery.deregisterAll();
    mockery.disable();
    callback();
}

var dbObj = undefined;

exports.updateAnimalCases = {
    setUp: function (callback) {
        var findResults = [
                    {  name: "ant",
                        positives: [
                            "Is it small?"
                        ],
                        negatives: [
                            "Is it bigger than a sofa?"
                        ]
                    }
                ];
        dbObj = new DatabaseObject(findResults);
        mockery.registerMock('./../routes/mongo.js', new MongoMockNew(dbObj));
        commonSetup(callback);
    },
    tearDown: tearDown,
    testUpdateAnimalSuccess: function (test) {
        var updateReq = { "cookies" : {
                            "guess": "ant",
                            "questionnumber":3,
                            "questionsanswers": "Can it fly?=no&Does it live in a group?=yes"},
                          "session": {
                            "cookieUsageWarning": ""
                            },
                        body : { name: "ant",
                            question: "Is it an insect?",
                            answer: "yes",
                        }};
        test.expect(7);
        var databaseUrl = "test";
        var collections = ["testAnimals"];
        var db = mongo.connect(databaseUrl, collections);
        game.updateAnimal(db.testAnimals, updateReq, res,
                          function (res, page) {
                              test.strictEqual(page, '/animal_added');
                              test.strictEqual(dbObj.testAnimals.lastUpdatedDocument.name, 'ant');
                              test.strictEqual(dbObj.testAnimals.lastUpdatedDocument.positives[0], 'Is it small?');
                              test.strictEqual(dbObj.testAnimals.lastUpdatedDocument.positives[1], 'Does it live in a group?');
                              test.strictEqual(dbObj.testAnimals.lastUpdatedDocument.positives[2], 'Is it an insect?');
                              test.strictEqual(dbObj.testAnimals.lastUpdatedDocument.negatives[0], 'Is it bigger than a sofa?');
                              test.strictEqual(dbObj.testAnimals.lastUpdatedDocument.negatives[1], 'Can it fly?');
                              test.done();
                          });
    },
    testUpdateAnimalAlertsNoQuestion: function (test) {
        var updateReq = { "cookies" : {
                            "guess": "ant",
                            "questionnumber":3,
                            "questionsanswers": "Can it fly?=no&Does it live in a group?=yes"},
                          "session": {
                            "cookieUsageWarning": ""
                            },
                        body : { name: "ant",
                            answer: "yes"
                        }};
        var res = {
            clearCookie : function(name) { },
            cookie : function(k,v,extras) { cookiePot[k]=v;},
            render : function(page, options) {
                test.strictEqual(page, 'lost');
                test.done();
            }
        }
        test.expect(1);
        var databaseUrl = "test";
        var collections = ["testAnimals"];
        var db = mongo.connect(databaseUrl, collections);
        game.updateAnimal(db.testAnimals, updateReq, res, function() {});
    },
    testUpdateAnimalAlertsNoAnswer: function (test) {
        var updateReq = { "cookies" : {
                            "guess": "ant",
                            "questionnumber":3,
                            "questionsanswers": "Can it fly?=no&Does it live in a group?=yes"},
                          "session": {
                            "cookieUsageWarning": ""
                            },
                        body : { name: "ant",
                            question: "Is it an insect?"
                        }};
        var res = {
            clearCookie : function(name) { },
            cookie : function(k,v,extras) { cookiePot[k]=v;},
            render : function(page, options) {
                test.strictEqual(page, 'lost');
                test.done();
            }
        }
        test.expect(1);
        var databaseUrl = "test";
        var collections = ["testAnimals"];
        var db = mongo.connect(databaseUrl, collections);
        game.updateAnimal(db.testAnimals, updateReq, res, function() {});
    }
}

exports.successCases = {
    setUp: function (callback) {
        var findResults = [
                    {  name: "frog",
                        positives: [
                            "Does it live in water?",
                            "Is it a predator?",
                            "Can it jump?"
                        ],
                        negatives: [
                            "Is it slimy?"
                        ] },
                    {  name: "lion",
                        positives: [
                            "Is it a predator?",
                            "Can it jump?"
                        ],
                        negatives: [
                            "Does it live in water?"
                        ] }
                ]
        mockery.registerMock('./../routes/mongo.js', new MongoMockNew(new DatabaseObject(findResults)));
        commonSetup(callback);
    },
    tearDown: tearDown,
    testNextQuestion: function (test) {
        test.expect(2);
        var databaseUrl = "test";
        var collections = ["testAnimals"];
        var db = mongo.connect(databaseUrl, collections);

        game.nextQuestion(db.testAnimals, req, res, function() {}, // redirect
                          function(req, res, questionnumber, question, qAndA) {
                              test.strictEqual(question, "Does it live in water?");
                              test.strictEqual(questionnumber, 1);
                              test.done();
                          });
    }
}

exports.errorCases = {
    setUp: function (callback) {
        DatabaseObject.prototype.testAnimals.find = function (query, callback) {
                    console.log('find: error ');
                    callback({error: "something"}, []);
                }
        mockery.registerMock('./../routes/mongo.js', new MongoMockNew(new DatabaseObject([])));
        commonSetup(callback);
    },
    tearDown: tearDown,
    testCallbackError: function (test) {
        test.expect(1);
        var databaseUrl = "test";
        var collections = ["testAnimals"];
        var db = mongo.connect(databaseUrl, collections);

        game.nextQuestion(db.testAnimals, req, res, function (res, page) {
            test.strictEqual(page, '/animal');
            test.done();
        },
        function (req, res, questionnumber, question, qAndA) {
            test.done();
        });
    }
};
