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

exports.animal = function(req, res) {
    console.log("app.get(/animal) " + utils.printCookies(req));

    mongo.db.questions.count(function(err, nbDocs) {
        if (err || !nbDocs || nbDocs.length == 0) {
            res.render('error', { pageTitle: 'Error',
                           errorReason: 'Could not connect to database' });
            return;
        }

        // Do what you need the count for here.
        console.log(nbDocs);
        var q = [];
        var r = _.random(0,nbDocs);
        mongo.db.questions.find({}).skip(r).limit(10, function(err, docs)
        {
            if (err || !docs || docs.length == 0) {
                res.render('error', { pageTitle: 'Error',
                               errorReason: 'Could not connect to database' });
                return;
            }

            console.log(docs);
            for (var i = 0; i < docs.length; i++) {
                console.log(docs[i]._id);
                q.push(docs[i].q);
            }

            mongo.db.a2.aggregate(
                        [
                            { $unwind : "$positives"},
                            { $group : {_id : "$positives" , number : { $sum : 1 } } },
                            { $sort : { number : 1 } },
                            { $project : { _id : 1 } },
                            { $limit : 15 }
                        ], function(err, docs) {
                            if (err || docs.length == 1) {
                                res.render('animal', { pageTitle: 'Add animal' , qAndA: q });
                                return;
                            }

                            console.log(docs);

                            for (var i = 0; i < docs.length; i++) {
                                console.log(docs[i]._id);
                                q.push(docs[i]._id);
                            }
                            mongo.db.a2.aggregate(
                                        [
                                            { $unwind : "$negatives"},
                                            { $group : {_id : "$negatives" , number : { $sum : 1 } } },
                                            { $sort : { number : 1 } },
                                            { $project : { _id : 1 } },
                                            { $limit : 15 }
                                        ], function(err, docs) {
                                            for (var i = 0; i < docs.length; i++) {
                                                console.log(docs[i]._id);
                                                q.push(docs[i]._id);
                                            }
                                            q = _.uniq(q);
                                            res.render('animal', { pageTitle: 'Add animal' , qAndA: q });
                                        });
                        });
        });
    });

};

exports.postAnimal = function(req, res) {
    console.log(req.body);

    var data = req.cookies.questionsanswers;

    var animal = { name: req.body.name,
        positives: [],
        negatives: []};
    if (data) {
        var numberOfQuestions = data.split("&");
        console.log("numberOfQuestions:" +  numberOfQuestions)


        for (var i = 0; i < numberOfQuestions.length; i++) {
            var tmp = numberOfQuestions[i].split('=');
            var q = tmp[0] + "";
            if (q == "")
                continue;
            var a = tmp[1] == 'yes' ? true : false;
            if (a)
                animal.positives.push(q);
            else
                animal.negatives.push(q);
        }
    };

    for (i in req.body) {
        if (i == 'name')
            continue;
        if (i == 'submit')
            continue;
        console.log(i);
        var a = req.body[i] == 'yes' ? true : false;
        if (a)
            animal.positives.push(i);
        else
            animal.negatives.push(i);
    }
    // remove duplicates
    animal.positives = _.uniq(animal.positives);
    animal.negatives = _.uniq(animal.negatives);
    console.log(animal);

    mongo.db.a2.insert(animal);

    utils.forceRefresh(res);

    utils.forceRefresh(res);
    res.redirect('/');
};


