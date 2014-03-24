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

exports.guess = function(req, res) {
    console.log("app.get(/guess) " + utils.printCookies(req));
    var questionnumber = Number(req.cookies.questionnumber);

    res.cookie('questionnumber', questionnumber + 1, { });

    res.render('guess', { pageTitle: 'Guess', guess: req.cookies.guess });
};

exports.guessyes = function(req, res){
    console.log("guessyes" + utils.printCookies(req));

    var data = req.cookies.questionsanswers;

    // update the db
    var numberOfQuestions = data.split("&");
    console.log("numberOfQuestions:" +  numberOfQuestions)
    mongo.db.a2.find({ name: req.cookies.guess }, function(err, animal) {
        if( err || !animal) {
            console.log("No animal found to update ");
            utils.forceRefresh(res);
            res.redirect('/');
            return;
        }

        for (var i = 0; i < numberOfQuestions.length; i++) {
            var tmp = numberOfQuestions[i].split('=');
            var q = tmp[0] + "";
            if (q == "")
                continue;
            if (tmp[1] === 'yes')
                animal[0].positives.push(q);
            else if (tmp[1] === 'no')
                animal[0].negatives.push(q);
        }
        // remove duplicates
        animal[0].negatives = _.uniq(animal[0].negatives);
        animal[0].positives = _.uniq(animal[0].positives);
        
        console.log(animal[0]);
        mongo.db.a2.update({ name: req.cookies.guess }, animal[0], {multi:false},function() {
            utils.forceRefresh(res);

            res.redirect('/');
        });
    });

};


exports.guessno = function(req, res){
    console.log("guessno", utils.printCookies(req));
    utils.forceRefresh(res);
    res.redirect('/lost');
};
