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

var MAX_QUESTION_LENGTH = 60;
var MIN_QUESTION_LENGTH = 5;

function parseQuestion(q) {
    if (!q) {
        return "No question";
    }
    if (q.length < MIN_QUESTION_LENGTH) {
        return "Question is too short";
    }
    if (q.length > MAX_QUESTION_LENGTH) {
        return "Question is too long";
    }
    if (q.indexOf('?') === -1) {
        return "No question mark";
    }
    return "";
}

exports.question = function (req, res) {
    console.log("app.get(/question) " + utils.printCookies(req));

    res.render('question', {pageTitle: 'Add Question',
               dismiss: utils.cookieUsageWarning(req),
               analytics: req.session.analytics});
};

exports.postQuestion = function (req, res) {
    console.log(utils.printCookies(req));

    var question = req.body.newquestion.toLowerCase().trim(),
        err = parseQuestion(question);
    if (err) {

        res.render('error', {pageTitle: 'Error',
                       errorReason: 'Bad question: ' + err,
                   dismiss: utils.cookieUsageWarning(req),
                   analytics: req.session.analytics});
        return;
    }

    mongo.db.questions.insert({q: question});

    utils.forceRefresh(res);
    res.redirect('/');
};
