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
var _ = require('underscore');
var utils = require('./utils.js');
var mongo = require('./mongo.js');

var COOKIE_QUESTIONSANSWERS  = 'questionsanswers';
var COOKIE_GUESS             = 'guess';
var COOKIE_CURRENT_QUESTION  = 'currentquestion';

function getQuery(yesQ, noQ) {
    var query = {
        positives : { $all : yesQ},
        negatives : { $all : noQ } };
    if (!yesQ.length && !noQ.length)
        query = {};
    else if (yesQ.length && !noQ.length)
        query = {positives : { $all : yesQ}};
    else if (!yesQ.length && noQ.length)
        query = {negatives : { $all : noQ } };
    
    return query;
}

function redirect(res, page) {
    utils.forceRefresh(res);
    res.redirect(page);
}

function render(req, res, questionnumber, question, qAndA) {
    utils.forceRefresh(res);

    res.render('game', { pageTitle: 'Game in Progress',
                   questionNumber: questionnumber,
                   question: question,
                   qAndAValue: qAndA,
                   dismiss: utils.cookieUsageWarning(req)});
}

function nextQuestion(collection, 
                      req, 
                      res, 
                      redirectCB,
                      renderCB)
{
    var yesNoArray = utils.getQandA(req);
    var qAndA = yesNoArray[0];
    var yesQ = yesNoArray[1];
    var noQ = yesNoArray[2];

    var questionnumber = Number(req.cookies.questionnumber);
    var numberOfQuestions = req.cookies.questionsanswers.split("&");
    questionnumber = numberOfQuestions.length;
    
    var query = getQuery(yesQ, noQ);

    console.log(query);
    
    collection.find(query, function(err, animal) {
        if( err || !animal) {
            console.log("No animal found to update ");
            console.log("Single animal found");
            console.log(animal);
            redirectCB(res, '/animal');
            return;
        } else if (animal.length === 1) {
            console.log("Single animal found");
            console.log(animal);
            console.log("SINGLE RESULT");
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
                            { $limit : 20 },
                        ], function(err, pos_result) {

                            collection.aggregate(
                                        [
                                            { $match : query},
                                            { $unwind : "$negatives"},
                                            { $group : {_id : "$negatives" , number : { $sum : 1 } } },
                                            { $sort : { number : -1 } },
                                            { $limit : 20 },
                                        ], function(err, neg_result) {

                                            var pos = [];
                                            for (var i = 0; i < pos_result.length; i++) {
                                                if (!_.contains(yesQ, pos_result[i]._id))
                                                    pos.push( pos_result[i]._id );
                                            }
                                            pos = _.without(pos, yesQ);

                                            var neg = [];
                                            for (var i = 0; i < neg_result.length; i++) {
                                                if (!_.contains(noQ, neg_result[i]._id))
                                                    neg.push( neg_result[i]._id );
                                            }
                                            neg = _.without(neg, noQ);
//                                            console.log(pos);
//                                            console.log(neg);

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

exports.lost = function(req, res) {
    utils.printCookies(req);
    var data = req.cookies.questionsanswers;

    var qAndA = utils.getQuestionsAndAnswers(data);

    utils.forceRefresh(res);
    res.render('lost', { pageTitle: 'Unknown Animal',
                   qAndAValue: qAndA,
               dismiss: utils.cookieUsageWarning(req)});
};

exports.won = function(req, res) {
    utils.printCookies(req);
    var data = req.cookies.questionsanswers;

    var qAndA = utils.getQuestionsAndAnswers(data);

    utils.forceRefresh(res);
    res.render('won', { pageTitle: 'Won',
                   qAndAValue: qAndA,
               dismiss: utils.cookieUsageWarning(req)});
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

    utils.forceRefresh(res);
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

