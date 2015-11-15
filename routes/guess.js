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

var COOKIE_QUESTIONSANSWERS  = 'questionsanswers';
var COOKIE_GUESS             = 'guess';
var COOKIE_CURRENT_QUESTION  = 'currentquestion';

exports.guess = function (req, res) {
//    console.log("app.get(/guess) " + utils.printCookies(req));
    var questionnumber = Number(req.cookies.questionnumber),
        yesNoArray = utils.getQandA(req),
        qAndA = yesNoArray[0];

    res.cookie(utils.COOKIE_QUESTIONNUMBER, questionnumber + 1, { });

    res.render('guess', {pageTitle: 'Guess',
                   questionNumber: questionnumber,
                   qAndAValue: qAndA,
                   guess: req.cookies.guess.toLowerCase(),
               analytics: req.session.analytics});
};

exports.guessyes = function (req, res) {
//    console.log("guessyes" + utils.printCookies(req));

    var data = req.cookies.questionsanswers;
    if (!data) {
        utils.forceRefresh(res);

        res.render('error', {pageTitle: 'Error',
                       errorReason: 'Cannot guess as no questions answered',
                   analytics: req.session.analytics});
        return;
    }

    // update the db
    var numberOfQuestions = data.split("&");
    mongo.db.a2.find({ name: req.cookies.guess.toLowerCase() }, function (err, animal) {
        var i, tmp, q;
        if (err || !animal || animal.length === 0) {
//            console.log("No animal found to update ");
            utils.forceRefresh(res);
            res.redirect('/');
            return;
        }

        for (i = 0; i < numberOfQuestions.length; i = i + 1) {
            tmp = numberOfQuestions[i].split('=');
            q = tmp[0] + '';
            if (q === "") {
                continue;
            }
            if (tmp[1] === 'yes') {
                animal[0].positives.push(q);
            } else if (tmp[1] === 'no') {
                animal[0].negatives.push(q);
            }
        }
        // remove duplicates
        animal[0].negatives = _.uniq(animal[0].negatives);
        animal[0].positives = _.uniq(animal[0].positives);

        //        console.log(animal[0]);
        mongo.db.a2.update({name: req.cookies.guess.toLowerCase() }, animal[0], {multi: false}, function (err, lastErrorObject) {
            utils.forceRefresh(res);
            res.redirect('/won');
            return;
        });
    });

};

exports.guessno = function (req, res) {
//    console.log("guessno", utils.printCookies(req));
    utils.forceRefresh(res);
    res.redirect('/lost');
};
