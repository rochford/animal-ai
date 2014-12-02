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

var _ = require('underscore'),
        utils = require('./utils.js'),
        mongo = require('./mongo.js');

var COOKIE_QUESTIONSANSWERS  = 'questionsanswers',
    COOKIE_GUESS             = 'guess',
    COOKIE_CURRENT_QUESTION  = 'currentquestion';

var MAX_QUESTION_LENGTH = 60,
    MIN_QUESTION_LENGTH = 5;

function parseQuestion(q) {
    if (q && q.length < MIN_QUESTION_LENGTH) {
        return "Question is too short.";
    }
    if (q && q.length > MAX_QUESTION_LENGTH) {
        return "Question is too long. Shorten the question.";
    }
    if (q && q.indexOf('?') === -1) {
        return "No question mark '?'. Add a question mark at the end.";
    }
    var profanity = utils.profanityCheck(q);
    if (profanity) {
        return "Question failed profanity check. Please alter question.";
    }
    return "";
}

function getQuery(yesQ, noQ) {
    var query = {
        positives : { $all : yesQ},
        negatives : { $all : noQ }
    };
    if (!yesQ.length && !noQ.length) {
        query = {};
    } else if (yesQ.length && !noQ.length) {
        query = {positives : { $all : yesQ}};
    } else if (!yesQ.length && noQ.length) {
        query = {negatives : { $all : noQ } };
    }

    return query;
}

function redirect(res, page) {
    utils.forceRefresh(res);
    res.redirect(page);
}

function render(req, res, questionnumber, question, qAndA) {
    utils.forceRefresh(res);

    res.render('game', {pageTitle: 'Game in Progress',
                   questionNumber: questionnumber,
                   question: question,
                   qAndAValue: qAndA,
                   dismiss: utils.cookieUsageWarning(req),
                   analytics: req.session.analytics});
}

function nextQuestion(collection,
                      req,
                      res,
                      redirectCB,
                      renderCB) {
    var yesNoArray = utils.getQandA(req),
        qAndA = yesNoArray[0],
        yesQ = yesNoArray[1],
        noQ = yesNoArray[2];

//    var questionnumber = Number(req.cookies.questionnumber);
    var numberOfQuestions = req.cookies.questionsanswers.split("&");
    var questionnumber = numberOfQuestions.length;

    var query = getQuery(yesQ, noQ);

    //    console.log(query);

    collection.find(query, function (err, animal) {
        if (err || !animal) {
            //            console.log("No animal found to update ");
            redirectCB(res, '/animal');
            return;
        } else if (animal.length === 1) {
            //            console.log("Single animal found");
            res.clearCookie(COOKIE_GUESS);
            res.cookie(COOKIE_GUESS, animal[0].name, { });
            redirectCB(res, '/guess');
            return;
        } else {
            //            console.log(animal);
            collection.aggregate(
                        [
                            { $match : query},
                            { $unwind : "$positives"},
                            { $group : {_id : "$positives" , number : { $sum : 1 } } },
                            { $sort : { number : -1 } },
                            { $limit : 20 }
                        ], function (err, pos_result) {

                            collection.aggregate(
                                        [
                                            { $match : query},
                                            { $unwind : "$negatives"},
                                            { $group : {_id : "$negatives" , number : { $sum : 1 } } },
                                            { $sort : { number : -1 } },
                                            { $limit : 20 },
                                        ], function (err, neg_result) {

                                            var i, // loop counter
                                                    pos = [],
                                                    neg = [];

                                            for (i = 0; i < pos_result.length; i = i + 1) {
                                                if (!_.contains(yesQ, pos_result[i]._id)) {
                                                    pos.push(pos_result[i]._id);
                                                }
                                            }
                                            pos = _.without(pos, yesQ);

                                            for (i = 0; i < neg_result.length; i = i + 1) {
                                                if (!_.contains(noQ, neg_result[i]._id)) {
                                                    neg.push(neg_result[i]._id);
                                                }
                                            }
                                            neg = _.without(neg, noQ);
                                            // console.log(pos);
                                            // console.log(neg);

                                            var result = _.intersection(pos, neg);
                                            //result = _.without(res, yesQ, noQ);
                                            if (!result.length) {
                                                result = _.difference(pos, neg);
                                            }
                                            var question = result[0];

                                            res.clearCookie(COOKIE_CURRENT_QUESTION);
                                            res.cookie(COOKIE_CURRENT_QUESTION, question, { });

                                            //                                            console.log(result);
                                            if (!question) {
                                                redirectCB(res, '/lost');
                                                return;
                                            }

                                            res.cookie(utils.COOKIE_QUESTIONNUMBER, questionnumber + 1, { });

                                            renderCB(req, res, questionnumber, question, qAndA);
                                        })
                        })
        }
    }
    )};

exports.nextQuestion = nextQuestion;

function updateAnimal(collection,
                      req,
                      res,
                      redirectCB)
{
    utils.printCookies(req);
    var data = req.cookies.questionsanswers;

    var qAndA = utils.getQuestionsAndAnswers(data);

    var animalName = req.body.name.toLowerCase().trim();
    var alerts = [];
    if (!animalName) {
        alerts.push('No animal name submitted.');
    }
    if (utils.profanityCheck(animalName)) {
        alerts.push('Animal name contained profanity.');
    }
    if (req.cookies.guess) {
        if (!req.body.question.toLowerCase()) {
            alerts.push('No question submitted.');
        }
        var answer = req.body['answer'];
        if (answer != 'no' && answer != 'yes') {
            alerts.push('Please answer the question by selecting No or Yes.');
        }
        var question = req.body.question.toLowerCase().trim();
        var err = parseQuestion(question);
        if (err) {
            alerts.push('Bad question: ' + err);
        }
    }

    //    console.log(alerts);
    if (alerts.length) {
        res.render('lost', { path: req.path,
                       alerts: alerts,
                       name: req.body.name,
                       question: req.body.question,
                       guess: req.cookies.guess,
                       pageTitle: 'Lost' , qAndAValue: qAndA,
                       dismiss: utils.cookieUsageWarning(req),
                       analytics: req.session.analytics});
        return;
    }

//    var animalName = req.body.name.toLowerCase().trim();
    var animal = {name: animalName,
        positives: [],
        negatives: []};

    if (data) {
        var numberOfQuestions = data.split("&");
        //        console.log("numberOfQuestions:" +  numberOfQuestions)

        for (var i = 0; i < numberOfQuestions.length; i++) {
            var tmp = numberOfQuestions[i].split('=');
            var q = tmp[0] + "";
            if (q === "") {
                continue;
            }
            var a = tmp[1]+ "";
            if (a === "") {
                continue;
            }
            if (a === 'yes') {
                animal.positives.push(q);
            } else if (a === 'no') {
                animal.negatives.push(q);
            }
        }
    }

    var addedToPositives = false;
    for (i in req.body) {
        if (i === 'name')
            continue;
        if (i === 'submit')
            continue;
        if (i === 'answer') {
            var a = req.body[i] == 'yes';
            if (a) {
                addedToPositives = true;
                animal.positives.push(req.body['question']);
            }
            else
                animal.negatives.push(req.body['question']);
        }
    }

    // remove duplicates
    animal.positives = _.uniq(animal.positives);
    animal.negatives = _.uniq(animal.negatives);

    if (req.cookies.guess) {
        if (!addedToPositives) {
            collection.update({name: req.cookies.guess.toLowerCase() },
                              { $addToSet: {positives: req.body['question']  },
                                  $pull: {negatives: req.body['question']  }});
        } else {
            console.log("addedTo negatives");
            collection.update({name: req.cookies.guess.toLowerCase() },
                              { $addToSet: {negatives: req.body['question']  },
                                  $pull: {positives: req.body['question']  }});
        }
    }

    collection.find({name: animalName}, function (err, docs) {

        if( err || !docs || docs.length === 0) {
            //            console.log("No animal found to update ");
            mongo.db.a2.insert(animal);
        } else if (docs.length === 1) {
            //            console.log("Single animal found");

            for (var i = 0; i < animal.positives.length; i++) {
                docs[0].positives.push(animal.positives[i]);
            }
            for (var i = 0; i < animal.negatives.length; i++) {
                docs[0].negatives.push(animal.negatives[i]);
            }

            docs[0].positives = _.uniq(docs[0].positives);
            docs[0].negatives = _.uniq(docs[0].negatives);

            collection.update({ name: animalName}, docs[0], { upsert: true });
        }

        redirectCB(res, '/animal_added');
        return;
    });
}

exports.postLostAddAnimal = function(req, res) {
    // update the new animal first
    updateAnimal(mongo.db.a2, req, res, redirect);
};

exports.lost = function(req, res) {
    utils.printCookies(req);
    var data = req.cookies.questionsanswers;

    var qAndA = utils.getQuestionsAndAnswers(data);

    utils.forceRefresh(res);
    res.render('lost', { pageTitle: 'Unknown Animal',
                   qAndAValue: qAndA,
                   name: "",
                   question:"",
                   guess: req.cookies.guess,
                   dismiss: utils.cookieUsageWarning(req),
                   analytics: req.session.analytics});
};

exports.won = function(req, res) {
    utils.printCookies(req);
    var data = req.cookies.questionsanswers;

    var qAndA = utils.getQuestionsAndAnswers(data);

    utils.forceRefresh(res);
    res.render('won', { pageTitle: 'Won',
                   qAndAValue: qAndA,
                   dismiss: utils.cookieUsageWarning(req),
                   analytics: req.session.analytics});
};

exports.game = function(req, res) {
    utils.printCookies(req);
    utils.forceRefresh(res);

    nextQuestion(mongo.db.a2, req, res, redirect, render);
};

exports.newgame = function(req, res) {
    utils.printCookies(req);
    utils.clearCookies(res);
    utils.resetCookies(res);

    //    utils.forceRefresh(res);
    res.redirect('/game');
};

exports.yes = function(req, res){
    utils.printCookies(req);

    res.cookie('questionsanswers', req.cookies.questionsanswers +
               req.cookies.currentquestion + '=yes&', { });
    res.clearCookie(COOKIE_CURRENT_QUESTION);

    res.redirect('/game');
};

exports.no = function(req, res){
    utils.printCookies(req);

    res.cookie('questionsanswers', req.cookies.questionsanswers +
               req.cookies.currentquestion + '=no&', { });
    res.clearCookie(COOKIE_CURRENT_QUESTION);

    res.redirect('/game');
};
