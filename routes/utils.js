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

var swearjar = require('swearjar');

var COOKIE_QUESTIONSANSWERS  = 'questionsanswers',
    COOKIE_QUESTIONNUMBER    = 'questionnumber',
    COOKIE_GUESS             = 'guess',
    COOKIE_CURRENT_QUESTION  = 'currentquestion';

exports.COOKIE_QUESTIONSANSWERS = COOKIE_QUESTIONSANSWERS;
exports.COOKIE_QUESTIONNUMBER = COOKIE_QUESTIONNUMBER;
exports.COOKIE_GUESS = COOKIE_GUESS;
exports.COOKIE_CURRENT_QUESTION = COOKIE_CURRENT_QUESTION;

exports.profanityCheck = function profanityCheck(text) {
    //console.log(swearjar.scorecard(text));
    return swearjar.profane(text);
}

exports.printCookies = function printCookies(req) {
    /*
    console.log("COOKIE - QUESTIONS: " + req.cookies.questionsanswers);
    console.log("COOKIE - GUESS: " + req.cookies.guess);
    console.log("COOKIE - QUESTIONNUMBER: " + req.cookies.questionnumber);
    console.log("COOKIE - CURRENT QUESTON: " + req.cookies.currentquestion);
    console.log("COOKIE - COOKIE_POLICY: " + req.cookies.cookiepolicy);
    */
}

exports.forceRefresh = function forceRefresh(res) {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
}

exports.clearCookies = function clearCookies(res) {
    res.clearCookie(COOKIE_QUESTIONNUMBER);
    res.clearCookie(COOKIE_QUESTIONSANSWERS);
    res.clearCookie(COOKIE_GUESS);
    res.clearCookie(COOKIE_CURRENT_QUESTION);
}

exports.resetCookies = function resetCookies(res) {
    res.cookie(COOKIE_QUESTIONNUMBER, 1, { });
    res.cookie(COOKIE_GUESS, '', { });
    res.cookie(COOKIE_QUESTIONSANSWERS, '', { });
    res.cookie(COOKIE_CURRENT_QUESTION, '', { });
}

exports.getQuestionsAndAnswers = function getQuestionsAndAnswers(data)  {
    var qAndA = [];

    if (data) {
        var numberOfQuestions = data.split("&");
        for (var i = 0; i < numberOfQuestions.length; i++) {
            console.log(numberOfQuestions[i]);
            var tmp = numberOfQuestions[i].split('=');
            var q = tmp[0] + "";
            var a = tmp[1] + "";
            if (q == "")
                continue;
            if (a == "")
                continue;
            var item = { question : q, answer: a  };
            qAndA.push(item);
        }
    }
    return qAndA;
}

exports.getQandA = function getQandA(req) {
    var data = req.cookies.questionsanswers;

    var yesQ = [];
    var noQ = [];
    var qAndA = exports.getQuestionsAndAnswers(data);
    for (var i = 0; i < qAndA.length; i++) {
        if (qAndA[i].answer  === 'yes')
            yesQ.push(qAndA[i].question);
        else if (qAndA[i].answer === 'no')
            noQ.push(qAndA[i].question);
    }
    return [qAndA, yesQ, noQ];
}

exports.getClientIp = function getClientIp(req) {
  var ipAddress = null;
  var forwardedIpsStr = req.headers['x-forwarded-for'];
  if (forwardedIpsStr) {
    ipAddress = forwardedIpsStr[0];
  }
  if (!ipAddress) {
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
};
