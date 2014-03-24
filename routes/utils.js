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
var COOKIE_QUESTIONSANSWERS  = 'questionsanswers';
var COOKIE_QUESTIONNUMBER    = 'questionnumber';
var COOKIE_GUESS             = 'guess';
var COOKIE_CURRENT_QUESTION  = 'currentquestion';

exports.COOKIE_QUESTIONSANSWERS = COOKIE_QUESTIONSANSWERS;
exports.COOKIE_QUESTIONNUMBER = COOKIE_QUESTIONNUMBER;
exports.COOKIE_GUESS = COOKIE_GUESS;
exports.COOKIE_CURRENT_QUESTION = COOKIE_CURRENT_QUESTION;

exports.printCookies = function printCookies(req) {
    console.log("COOKIE - QUESTIONS: " + req.cookies.questionsanswers);
    console.log("COOKIE - GUESS: " + req.cookies.guess);
    console.log("COOKIE - QUESTIONNUMBER: " + req.cookies.questionnumber);
    console.log("COOKIE - CURRENT QUESTON: " + req.cookies.currentquestion);
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
    res.cookie(COOKIE_QUESTIONNUMBER, 0, { });
    res.cookie(COOKIE_GUESS, '', { });
    res.cookie(COOKIE_QUESTIONSANSWERS, '', { });
    res.cookie(COOKIE_CURRENT_QUESTION, '', { });
}


exports.getQuestionsAndAnswers = function getQuestionsAndAnswers(data)  {
    var qAndA = [];

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
        //        questionsAsked.push(q);
        var item = { question : q, answer: a  };
        qAndA.push(item);
    }
    return qAndA;
}

exports.resetDb = function resetDb(db) {

    db.questions.remove();
    db.a2.remove();

    db.a2.insert({  name: "frog",
                     positives: [
                         "Does it live in water?",
                         "Is it a predator?",
                         "Can it jump?"
                         ],
                     negatives: [
                         "Is it dangerous?",
                         "Does it live in the arctic?",
                         "Is it considered intelligent?",
                         "Is it a mammal?"
                     ] });
    /*
    db.a2.insert({  name: "shark",
                     positives: ["Does it live in water?",
                         "Is it dangerous?",
                         "Is it a predator?",
                         "Does it live in the arctic?"
                         ],
                     negatives: [
                         "Is it considered intelligent?",
                         "Is it a mammal?",
                         "Does it live in African grass lands?"
                     ] });
    db.a2.insert({  name: "zebra",
                     positives: ["Is it a mammal?",
                         "Does it live in African grass lands?"],
                     negatives: ["Does it live in water?",
                         "Is it a predator?",
                         "Is it dangerous?"] });
    db.a2.insert({  name: "tiger",
                     positives: ["Is it a mammal?",
                         "Is it dangerous?",
                         "Is it a predator?",
                         "Is it considered intelligent?"],
                     negatives: ["Does it live in water?",
                         "Does it live in the arctic?",
                         "Does it live in African grass lands?"] });
    db.a2.insert({  name: "lion",
                     positives: ["Is it a mammal?",
                         "Is it dangerous?",
                         "Is it a predator?",
                         "Is it considered intelligent?",
                         "Does it live in African grass lands?"],
                     negatives: ["Does it live in water?",
                         "Does it live in the arctic?"
                     ] });
    db.a2.insert({  name: "snow leopard",
                     positives: ["Is it a mammal?",
                         "Is it a predator?",
                         "Is it dangerous?",
                         "Is it considered intelligent?",
                         "Does it live in the arctic?",
                         "Can it jump?"
                     ],
                     negatives: ["Does it live in water?",
                         "Does it live in African grass lands?"
                     ] });
    db.a2.insert({  name: "crocodile",
                     positives: ["Does it live in water?",
                         "Is it a predator?",
                         "Is it dangerous?",
                         "Does it live in African grass lands?"
                     ],
                     negatives: [
                         "Is it a mammal?",
                         "Is it considered intelligent?",
                         "Can it use tools?",
                         "Can it fly?"
                     ] });
    db.a2.insert({  name: "owl",
                     positives: [
                         "Is it a predator?",
                         "Does it live in African grass lands?",
                         "Can it fly?"
                     ],
                     negatives: [
                         "Is it a mammal?",
                         "Does it live in water?",
                         "Is it considered intelligent?",
                         "Is it dangerous?",
                         "Can it use tools?"
                     ] });
    db.a2.insert({  name: "snake",
                     positives: [
                         "Is it a predator?",
                         "Does it live in African grass lands?",
                         "Is it dangerous?"
                     ],
                     negatives: [
                         "Is it a mammal?",
                         "Does it live in water?",
                         "Is it considered intelligent?"
                     ] });
    */
    db.questions.insert( { q: "Can it climb?"});
    db.questions.insert( { q: "Is it a mammal?"});
    db.questions.insert( { q: "Does it live in the forest?"});
    db.questions.insert( { q: "Does it have a long tail?"});
    db.questions.insert( { q: "Does it bring joy to people?"});
    db.questions.insert( { q: "Can you see it in a zoo?"});
    db.questions.insert( { q: "Is it small?"});
    db.questions.insert( { q: "Does it have claws?"});
    db.questions.insert( { q: "Does it like to clean itself?"});
    db.questions.insert( { q: "Is it considered intelligent?"});
    db.questions.insert( { q: "Does it jump?"});
    db.questions.insert( { q: "Can it be tamed?"});
    db.questions.insert( { q: "Is it brown?"});
    db.questions.insert( { q: "Is it colourful?"});
    db.questions.insert( { q: "Is it heavy?"});
    db.questions.insert( { q: "Is it a predator?"});
    db.questions.insert( { q: "Does it live in African grass lands?"});
    db.questions.insert( { q: "Is it bigger than a sofa?"});
    db.questions.insert( { q: "Is it awake at night?"});
    db.questions.insert( { q: "Does it eat grass?"});
    db.questions.insert( { q: "Does it have spots?"});
    db.questions.insert( { q: "Does it have a long neck?"});
    db.questions.insert( { q: "Can you lift it?"});
    db.questions.insert( { q: "Does it have teeth?"});
    db.questions.insert( { q: "Does it bite?"});
    db.questions.insert( { q: "Is it a herbivore?"});
    db.questions.insert( { q: "Does it stand on two legs?"});
    db.questions.insert( { q: "Does it eat leaves?"});
    db.questions.insert( { q: "Can it live out of water?"});
    db.questions.insert( { q: "Can it fly?"});
    db.questions.insert( { q: "Is it dangerous?"});
    db.questions.insert( { q: "Can it swim?"});
    db.questions.insert( { q: "Does it live near water?"});
    db.questions.insert( { q: "Is it flexible?"});
    db.questions.insert( { q: "Does it have paws?"});
    db.questions.insert( { q: "Does it have fur?"});
    db.questions.insert( { q: "Is it hunted?"});
    db.questions.insert( { q: "Does it live in groups?"});
    db.questions.insert( { q: "Does it have legs?"});
    db.questions.insert( { q: "Can it be used for transport?"});
    db.questions.insert( { q: "Does it have wiskers?"});
    db.questions.insert( { q: "Does it eat fish?"});
    db.questions.insert( { q: "Does it bark?"});
    db.questions.insert( { q: "Does it hunt in groups?"});
}
