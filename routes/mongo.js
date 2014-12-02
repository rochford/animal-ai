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

var mongodb = require('mongojs');

module.exports.init = function (callback) {
    var databaseUrl = process.env.MONGO_SERVER_URL, // "username:password@example.com/mydb"
        collections = ["questions", "a2"];
    module.exports.db = require("mongojs").connect(databaseUrl, collections);
    callback();
}
