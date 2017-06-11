
var db = require('../moduls/databaseManager');
var dbHelper = require("../moduls/databaseHelper");
var uuid = require("uuid");
var fs = require ("fs");

exports.addDenkmal = function (denkmal) {
   
         
                var id = "test";
				var typ = "test";
				
                db.none("INSERT INTO test_tab(id, typ) VALUES ($1, $2)",['Mayor', 'McCheese'])
                    .then(function (data) {
                    }).catch(dbHelper.onError);
            };

        

exports.setUpSummaryFromApi = function () {
    //TODO Implement mehtod when API is ready
	//get data from data.json
	//fs = require('fs')
/*fs.readFile('../../resources/pois.json', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  var jsondata=JSON.parse(data);
  //weiter bearbeiten
});*/
};
