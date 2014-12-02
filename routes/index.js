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

exports.dismiss = function (req, res) {
    res.cookie(utils.COOKIE_POLICY, 'OK', { });
    res.redirect(req.get('referer'));
};

exports.animal_added = function (req, res) {
//    console.log("app.get(/animal_added) " + utils.printCookies(req));
    utils.clearCookies(res);
    utils.resetCookies(res);

    res.render('animal_added', {path: req.path, pageTitle: 'Animal Added',
               dismiss: utils.cookieUsageWarning(req),
               analytics: req.session.analytics});
};

exports.about = function (req, res) {
//    console.log("app.get(/about) " + utils.printCookies(req));
    utils.clearCookies(res);
    utils.resetCookies(res);

    res.render('about', {path: req.path, pageTitle: 'About AnimalGuess',
               dismiss: utils.cookieUsageWarning(req),
               analytics: req.session.analytics});
};

exports.error = function (req, res) {
//    console.log("app.get(/error) " + utils.printCookies(req));
    utils.clearCookies(res);
    utils.resetCookies(res);

    res.render('error', {pageTitle: 'Error',
               dismiss: utils.cookieUsageWarning(req),
               analytics: req.session.analytics});
};

exports.index =  function (req, res) {
//    console.log("app.get(/index) ");
    utils.printCookies(req);
    utils.clearCookies(res);
    utils.resetCookies(res);

    res.render('index', { path: req.path,
                           pageTitle: 'Animal Guess',
                           dismiss: utils.cookieUsageWarning(req),
               analytics: req.session.analytics});
}
