/**
 * Created by insanemac on 31/05/2017.
 */
var pgp = require("pg-promise")();
var databaseConf = require("../../config/database");

var database = pgp(databaseConf.connectionURL);

module.exports = database;