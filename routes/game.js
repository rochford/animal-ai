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
var COOKIE_QUESTIONNUMBER    = 'questionnumber';
var COOKIE_GUESS             = 'guess';
var COOKIE_CURRENT_QUESTION  = 'currentquestion';


exports.game = function(req, res) {
    console.log("app.get() " + utils.printCookies(req));
    var questionnumber = Number(req.cookies.questionnumber);

    nextQuestion(req, res);
};

exports.yes = function(req, res){
    console.log("yes" + utils.printCookies(req));

    res.cookie('questionsanswers', req.cookies.questionsanswers +
               req.cookies.currentquestion + '=yes&', { });
    res.clearCookie(COOKIE_CURRENT_QUESTION);

    res.redirect('/game');
};

exports.no = function(req, res){
    console.log("no" + utils.printCookies(req));

    res.cookie('questionsanswers', req.cookies.questionsanswers +
               req.cookies.currentquestion + '=no&', { });
    res.clearCookie(COOKIE_CURRENT_QUESTION);

    res.redirect('/game');
};


function nextQuestion(req, res) {
    var yesQ = [];
    var noQ = [];

    var questionnumber = Number(req.cookies.questionnumber);
    var data = req.cookies.questionsanswers;

    var qAndA = utils.getQuestionsAndAnswers(data);
    for (var i = 0; i < qAndA.length; i++) {
        if (qAndA[i].answer  === 'yes')
            yesQ.push(qAndA[i].question);
        else if (qAndA[i].answer === 'no')
            noQ.push(qAndA[i].question);
    }

    var query = {
        positives : { $all : yesQ},
        negatives : { $all : noQ } };
    if (!yesQ.length && !noQ.length)
        query = {};
    else if (yesQ.length && !noQ.length)
        query = {positives : { $all : yesQ}};
    else if (!yesQ.length && noQ.length)
        query = {negatives : { $all : noQ } };

    console.log(query);

    mongo.db.a2.find(query, function(err, animal) {
        if( err || !animal) {
            console.log("No animal found to update ");
            console.log("Single animal found");
            console.log(animal);
            res.redirect('/animal');
            return;
        } else if (animal.length === 1) {
            console.log("Single animal found");
            console.log(animal);
            console.log("SINGLE RESULT");
            res.clearCookie(COOKIE_GUESS);
            res.cookie(COOKIE_GUESS, animal[0].name, { });
            res.redirect('/guess');

            return;
        } else {
            console.log(animal);
            mongo.db.a2.aggregate(
                        [
                            { $match : query},
                            { $unwind : "$positives"},
                            { $group : {_id : "$positives" , number : { $sum : 1 } } },
                            { $sort : { number : -1 } },
                            { $limit : 20 },
                        ], function(err, pos_result) {

                            console.log("XXX 2");
                            mongo.db.a2.aggregate(
                                        [
                                            { $match : query},
                                            { $unwind : "$negatives"},
                                            { $group : {_id : "$negatives" , number : { $sum : 1 } } },
                                            { $sort : { number : -1 } },
                                            { $limit : 20 },
                                        ], function(err, neg_result) {

                                            console.log(pos_result);
                                            console.log(neg_result);
                                            var pos = [];
                                            for (var i = 0; i < pos_result.length; i++) {
                                                if (!_.contains(yesQ, pos_result[i]._id))
                                                    pos.push( pos_result[i]._id );
                                            }
                                            console.log(yesQ);
                                            pos = _.without(pos, yesQ);

                                            var neg = [];
                                            for (var i = 0; i < neg_result.length; i++) {
                                                if (!_.contains(noQ, neg_result[i]._id))
                                                    neg.push( neg_result[i]._id );
                                            }
                                            neg = _.without(neg, noQ);
                                            console.log(pos);
                                            console.log(neg);

                                            var result = _.intersection(pos, neg);
                                            //result = _.without(res, yesQ, noQ);
                                            var question = result[0];
                                            console.log("XXX 4: question", question);
                                            if (!result.length)
                                                result = _.difference(pos, neg);
                                            question = result[0];
                                            console.log("XXX 5: question", question);

                                            res.cookie(COOKIE_QUESTIONNUMBER, questionnumber + 1, { });

                                            res.clearCookie(COOKIE_CURRENT_QUESTION);
                                            res.cookie(COOKIE_CURRENT_QUESTION, question, { });

                                            res.render('game', { pageTitle: 'Game in Progress',
                                                           questionNumber: questionnumber,
                                                           question: question,
                                                           qAndA: []});
                                        })
                        })
        }
    }
    )};
