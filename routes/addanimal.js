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

function getAllDbQuestions(req, res, alerts, callback)
{
    mongo.db.questions.count(function(err, nbDocs) {
        if (err || !nbDocs || nbDocs.length === 0) {
            res.render('error', {pageTitle: 'Error',
                           errorReason: 'Could not connect to database',
                       analytics: req.session.analytics});
        }

        var alreadyAsked = [];
        var data = req.cookies.questionsanswers;
        if (data) {
            var numberOfQuestions = data.split("&");

            for (var i = 0; i < numberOfQuestions.length; i++) {
                var tmp = numberOfQuestions[i].split('=');
                var q = tmp[0] + "";
                if (q == "")
                    continue;
                alreadyAsked.push(q);
            }
        };
        callback(req, res, nbDocs, alreadyAsked, alerts);
    })
}

function removeAlreadyAskedQuestions(req, res, nbDocs, alreadyAsked, alerts) {

    var q = [];
    var r = _.random(0,nbDocs);
    mongo.db.questions.find({q: {$nin : alreadyAsked }}).skip(r).limit(10, function (err, docs)
    {
        if (err || !docs || docs.length === 0) {
            res.render('error', {pageTitle: 'Error',
                           errorReason: 'Could not connect to database',
                       analytics: req.session.analytics});
            return;
        }

        for (var i = 0; i < docs.length; i++) {
//            console.log(docs[i]._id);
            q.push(docs[i].q);
        }

        res.render('animal', {path: req.path,
                       alerts: alerts,
                       pageTitle: 'Add Animal', qAndA: q,
                   analytics: req.session.analytics});
    });

}

exports.animal = function (req, res) {
//    console.log("app.get(/animal) ");
    utils.printCookies(req);

    getAllDbQuestions(req, res, [], removeAlreadyAskedQuestions);
}

function redirect(res, page) {
    utils.forceRefresh(res);
    res.redirect(page);
}

function updateAnimal(collection,
                      req,
                      res,
                      redirectCB)
{
    var loop;
    if (!req.body.name.toLowerCase()) {
        getAllDbQuestions(req, res, ['No animal name submitted.'], removeAlreadyAskedQuestions);
        return;
    }
    var animalName = req.body.name.toLowerCase().trim();
    var animal = { name: animalName,
        positives: [],
        negatives: []};
    var data = req.cookies.questionsanswers;
    if (data) {
        var numberOfQuestions = data.split("&");

        for (loop = 0; i < numberOfQuestions.length; loop = loop + 1) {
            var tmp = numberOfQuestions[loop].split('=');
            var q = tmp[0] + "";
            if (q == "")
                continue;
            var a = tmp[1]+ "";
            if (a === "")
                continue;
            if (a === 'yes')
                animal.positives.push(q);
            else if (a === 'no')
                animal.negatives.push(q);
        }
    };

    for (i in req.body) {
        if (i === 'name')
            continue;
        if (i === 'submit')
            continue;
        // console.log(i);
        var a = req.body[i] === 'yes' ? true : false;
        if (a)
            animal.positives.push(i);
        else
            animal.negatives.push(i);
    }

    // remove duplicates
    animal.positives = _.uniq(animal.positives);
    animal.negatives = _.uniq(animal.negatives);

    collection.find({name: animalName}, function (err, docs) {

        if(err || !docs || docs.length === 0) {
//            console.log("No animal found to update ");
            mongo.db.a2.insert(animal);
        } else if (docs.length === 1) {
//            console.log("Single animal found");

            for (loop = 0; i < animal.positives.length; loop = loop + 1) {
                docs[0].positives.push(animal.positives[loop]);
            }
            for (loop = 0; i < animal.negatives.length; loop = loop + 1) {
                docs[0].negatives.push(animal.negatives[loop]);
            }

            docs[0].positives = _.uniq(docs[0].positives);
            docs[0].negatives = _.uniq(docs[0].negatives);

            collection.update({name: animalName}, docs[0], {upsert: true});
        }

        redirectCB(res, '/animal_added');
        return;
    });
}

exports.postAnimal = function (req, res) {
//    console.log(req.body);

    updateAnimal(mongo.db.a2, req, res, redirect);
};


