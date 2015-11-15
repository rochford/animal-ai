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

var express = require('express'),
        addanimal = require('./routes/addanimal.js'),
        bodyParser = require('body-parser'),
        compression = require('compression'),
        connect = require('connect'),
        cookieParser = require('cookie-parser'),
        errorhandler = require('errorhandler'),
        expresssession = require('express-session'),
        game = require('./routes/game.js'),
        guess = require('./routes/guess.js'),
        http = require('http'),
        index = require('./routes/index.js'),
        methodOverride = require('method-override'),
        morgan = require('morgan'),
        mongo = require('./routes/mongo.js'),
        session = require('express-session'),
        mongoStore = require('connect-mongo')(session),
        path = require('path'),
        utils = require('./routes/utils.js'),
        _ = require('underscore');
var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(function (req, res, next) {
    if ('/robots.txt' === req.url) {
        res.type('text/plain');
        res.send("User-agent: *\nAllow: /\nDisallow: /css/\nDisallow: /lib/\nDisallow: /bootstrap/\nDisallow: /game\nDisallow: /animal\nDisallow: /question\nDisallow: /guess\nDisallow: /animal_added");
    } else {
        next();
    }
});

app.use(compression({threshold: 512}));
app.use(cookieParser()); // cookie secret is session secret
app.use(session({
                    secret: process.env.COOKIE_SECRET || 'aij',
                    resave: false,
                    saveUninitialized: true,
                    cookie: { maxAge: new Date(Date.now() + 3600000*24*7*2) }, // 2 weeks
                    store: new mongoStore({ url: process.env.MONGO_SERVER_URL,
                                              collection: 'sessions'
                                          })
                }));
app.use(bodyParser.urlencoded({ extended: false })); // to support URL-encoded bodies
app.use(morgan('dev'));
app.use(function (req, res, next) {
    var ip = utils.getClientIp(req);

    if (ip === process.env.DEV_IP) {
        req.session.analytics = false;
    } else {
        req.session.analytics = true;
    }
    next();
});

app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
    app.use(errorhandler());
}

app.get('/', index.index);
app.get('/about', index.about);
app.get('/error', index.error);

app.get('/newgame', game.newgame);
app.get('/game', game.game);
app.get('/won', game.won);

app.get('/lost', game.lost);
app.post('/lostaddanimal', game.postLostAddAnimal);

app.get('/yes', game.yes);
app.get('/no', game.no);

app.get('/animal_added', index.animal_added);

app.get('/guessyes', guess.guessyes);
app.get('/guessno', guess.guessno);
app.get('/guess', guess.guess);
app.get('/privacy-policy', index.privacy);

// Disabled for now.
// app.get('/animal', addanimal.animal);
// app.post('/animal', addanimal.postAnimal);

mongo.init(function (error) {
    if (error) {
        throw error;
    }
    if (!process.env.PORT) {
        console.error('No port defined');
        return;
    }

    if (!process.env.COOKIE_SECRET) {
        console.error('No COOKIE_SECRET defined');
        return;
    }
    if (!process.env.MONGO_SERVER_URL) {
        console.error('No MONGO_SERVER_URL defined');
        return;
    }

    http.createServer(app).listen(app.get('port'), function () {
        console.log("Express server listening on port " + app.get('port'));
    });
});
