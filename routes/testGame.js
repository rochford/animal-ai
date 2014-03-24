
// module under test
var game = require('./game');

var _ = require('underscore');
var utils = require('./utils.js');
var mongo = require('./mongo.js');


var cookiePot = [];
var db;
var req = { "cookies" : { 
        "questionnumber":0,
        "questionsanswers": ""}};
var res = { 
    clearCookie : function(name) { },
    cookie : function(k,v,extras) { cookiePot[k]=v;}
};

function setup() {
    cookiePot = [];
    var databaseUrl = "test"; // "username:password@example.com/mydb"
    var collections = ["testQuestions","testAniamls"];
    db = require("mongojs").connect(databaseUrl, collections);
    
    db.testAniamls.remove({});
    db.testAniamls.insert({  name: "frog",
                              positives: [
                                  "Does it live in water?",
                                  "Is it a predator?",
                                  "Can it jump?"
                              ],
                              negatives: [
                                  "Is it slimy?"
                              ] });
    db.testAniamls.insert({  name: "lion",
                              positives: [
                                  "Is it a predator?",
                                  "Can it jump?"
                              ],
                              negatives: [
                                  "Does it live in water?"
                              ] });
}

function redirect(res, page) {
    console.log('redirect: ' + page);
}

function render(res, questionnumber, question, qAndA) {
    console.log('question: ' + question);
}

exports.nextQuestion = function(test)  {
    test.expect(2);
    setup();
    game.nextQuestion(db.testAniamls, req, res, redirect, 
                      function(res, questionnumber, question, qAndA) {
                          test.strictEqual(question, "Does it live in water?");
                          test.strictEqual(questionnumber, 0);
                          test.done();
                      });
}
