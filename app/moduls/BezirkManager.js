/**
 * Created by InSane on 25.06.2017.
 */
var db = require('../moduls/databaseManager');
var dbHelper = require("../moduls/databaseHelper");

exports.getBezirkCoorList = function (callback) {
    db.any("SELECT * FROM stamm_bezirke").then(callback).catch(dbHelper.onError);
};