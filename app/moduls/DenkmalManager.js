
var db = require('../moduls/databaseManager');
var dbHelper = require("../moduls/databaseHelper");
var uuid = require("uuid");
var fs = require ("fs");

exports.addDenkmal = function (denkmal) {
   
         
                var id = uuid.v4();
                db.none("INSERT INTO denkmal(id, typ, name, long, lat) " +
                        "VALUES(${id}, ${typ}, ${name}, ${long}, ${lat})")
                    .then(function (data) {
                    }).catch(dbHelper.onError);
            }

        
};

exports.setUpSummaryFromApi = function () {
    //TODO Implement mehtod when API is ready
	//get data from data.json
	fs = require('fs')
fs.readFile('../../resources/pois.json', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  var jsondata=JSON.parse(data));
  //weiter bearbeiten
});
};
