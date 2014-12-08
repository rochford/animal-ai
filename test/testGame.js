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

function redirect(res, page) {
    console.log('redirect: ' + page);
}

function render(res, questionnumber, question, qAndA) {
    console.log('question: ' + question);
}

var dbObject = {
    aggregateState: 1,
    testAnimals: {
        aggregate: function(array, callback) {
            console.log("aggregate");
            if (this.aggregateState++ === 1) {
                callback(null, [{_id: "Is it a predator?", number: 2},
                                {_id: "Can it jump?", number: 2},
                                {_id: "Does it live in water?", number: 1}]);
            } else {
                callback(null, [{_id: "Does it live in water?", number: 1},
                                {_id: "Is it slimy?", number: 1}]);
            }
        },

        find: function(query, callback) {
            console.log(query);
            callback(null, [
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
                     );
        }
    }
}

var dbObject2 = {
    testAnimals: {
        find: function(query, callback) {
            console.log(query);
            callback({error: "something"}, []);
        }
    }
}

var mongoMock = {
    connect: function () { console.log('connect'); return dbObject; }
};

var mongoMock2 = {
    connect: function () { console.log('connect'); return dbObject2; }
}

var utilMock = {
    forceRefresh: function () { console.log('forceRefresh'); }
}

var cookiePot = [];
var db;
var req = { "cookies" : {
        "questionnumber":0,
        "questionsanswers": ""}};
var res = {
    clearCookie : function(name) { },
    cookie : function(k,v,extras) { cookiePot[k]=v;}
};

var utils, mongo;

function commonSetup(callback) {
    console.log('setup');
    mockery.registerAllowable('underscore');
    mockery.registerAllowable('util');
    mockery.registerAllowable('./../routes/game.js');
    mockery.registerMock('./../routes/utils.js', utilMock);

    mockery.enable();
    var _ = require('underscore');
    utils = require('./../routes/utils.js');
    mongo = require('./../routes/mongo.js');
    callback();
}

function tearDown(callback) {
    // clean up
    console.log('teardown');
    mockery.deregisterAll();
    mockery.disable();
    callback();
}

exports.successCases = {
    setUp: function (callback) {
        console.log('setup');

        mockery.registerMock('./../routes/mongo.js', mongoMock);
        commonSetup(callback);
    },
    tearDown: tearDown,
    test1: function (test) {
        console.log('test1');
        test.expect(2);
        var databaseUrl = "test";
        var collections = ["testQuestions","testAnimals"];
        var db = mongo.connect(databaseUrl, collections);

        game.nextQuestion(db.testAnimals, req, res, redirect,
                          function(req, res, questionnumber, question, qAndA) {
                              console.log(question);
                              console.log(questionnumber);
                              test.strictEqual(question, "Does it live in water?");
                              test.strictEqual(questionnumber, 1);
                              test.done();
                          });
    }
}

exports.errorCases = {
    setUp: function (callback) {
        mockery.registerMock('./../routes/mongo.js', mongoMock2);
        commonSetup(callback);
    },
    tearDown: tearDown,
    callbackError: function (test) {
        console.log('callbackError');
        test.expect(1);
        var databaseUrl = "test";
        var collections = ["testQuestions","testAnimals"];
        var db = mongo.connect(databaseUrl, collections);

        game.nextQuestion(db.testAnimals, req, res, function (res, page) {
                                                        console.log('redirect: ' + page);
                                                        test.strictEqual(page, '/animal');
                                                        test.done();
                                                        },
                          function (req, res, questionnumber, question, qAndA) {
                              test.done();
                          });
    }
};
