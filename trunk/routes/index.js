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

exports.about = function(req, res){
    console.log("app.get(/about) " + utils.printCookies(req));
    utils.clearCookies(res);
    utils.resetCookies(res);

    res.render('about', { pageTitle: 'About' });
};

exports.error = function(req, res){
    console.log("app.get(/error) " + utils.printCookies(req));
    utils.clearCookies(res);
    utils.resetCookies(res);

    res.render('error', { pageTitle: 'Error' });
};

exports.index =  function(req, res){
    console.log("app.get(/index) ");
    utils.printCookies(req);
    utils.clearCookies(res);
    utils.resetCookies(res);
    mongo.db.a2.find({}, function(err, animals) {
        if (err || !animals || animals.length == 0) {
            res.render('error', { pageTitle: 'Error',
                           errorReason: 'Could not connect to database' });
            return;
        }

        var count = animals.length;

        mongo.db.questions.find({}, function(err, q) {
            if (err || !q || q.length == 0) {
                res.render('error', { pageTitle: 'Error',
                               errorReason: 'Could not connect to database' });
                return;
            }
            var qCount = q.length;

            res.render('index', { pageTitle: 'Animal Guess',
                           numberAnimals: count,
                           numberQuestions: qCount});
        });
    });
}


