
// module under test
var game = require('./game.js');

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
    var collections = ["testQuestions","testAnimals"];
    db = require("mongojs").connect(databaseUrl, collections);
    
    db.testAnimals.remove({});
    db.testAnimals.insert({  name: "frog",
                              positives: [
                                  "Does it live in water?",
                                  "Is it a predator?",
                                  "Can it jump?"
                              ],
                              negatives: [
                                  "Is it slimy?"
                              ] });
    db.testAnimals.insert({  name: "lion",
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
    game.nextQuestion(db.testAnimals, req, res, redirect, 
                      function(req, res, questionnumber, question, qAndA) {
                          console.log(question);
                          console.log(questionnumber);
                          test.strictEqual(question, "Does it live in water?");
                          test.strictEqual(questionnumber, 1);
                          test.done();
                      });
}
