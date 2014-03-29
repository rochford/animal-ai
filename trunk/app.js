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

var express = require('express')
, index = require('./routes/index.js')
, game = require('./routes/game.js')
, guess = require('./routes/guess.js')
, addquestion = require('./routes/addquestion.js')
, addanimal = require('./routes/addanimal.js')
, http = require('http')
, path = require('path');
var _ = require('underscore');
var utils = require('./routes/utils.js')
var mongo = require('./routes/mongo.js');
var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.cookieParser(process.env.COOKIE_SECRET));
    app.use(express.urlencoded()); // to support URL-encoded bodies
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));

});

app.configure('development', function(){
    app.use(express.errorHandler());
});

app.get('/', index.index);
app.get('/about', index.about);
app.get('/error', index.error);

app.get('/game', game.game);
app.get('/lost', game.lost);
app.get('/yes', game.yes);
app.get('/no', game.no);

app.get('/guessyes', guess.guessyes);
app.get('/guessno', guess.guessno);
app.get('/guess', guess.guess);

app.get('/question', addquestion.question);
app.post('/question', addquestion.postQuestion);

app.get('/animal', addanimal.animal);
app.post('/animal', addanimal.postAnimal);

mongo.init(function (error) {
    if (error)
        throw error;

    if (!process.env.PORT ) {
        console.error('No port defined');
        return;
    }

    if (!process.env.COOKIE_SECRET ) {
        console.error('No COOKIE_SECRET defined');
        return;
    }
    if (!process.env.MONGO_SERVER_URL ) {
        console.error('No MONGO_SERVER_URL defined');
        return;
    }
    
    http.createServer(app).listen(app.get('port'), function(){
        console.log("Express server listening on port " + app.get('port'));
    });
});
