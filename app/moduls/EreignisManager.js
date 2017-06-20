/**
 * Created by InSane on 31.05.2017.
 */

var db = require('../moduls/databaseManager');
var dbHelper = require("../moduls/databaseHelper");
var RestApi = require("../moduls/restApiManager");
var uuid = require("uuid");

exports.addEreignis = function (ereignis) {
    var that = this;
    db.oneOrNone("SELECT EXISTS(SELECT 1 FROM ereignis_content WHERE id=$1)", ereignis.id)
        .then(function (data) {
            if(!data.exists){
                var id = uuid.v4();
                ereignis.ownId = id;
                db.none("INSERT INTO ereignis(id, typ) VALUES ($1, $2)", [id, ereignis.kategorie]).catch(dbHelper.onError);
                db.none("INSERT INTO ereignis_content(id, titel, description, bezirk, adresse, url, zeitpunkt, ereignisid) " +
                        "VALUES(${id}, ${titel}, ${inhalt}, ${bezirk}, ${adresse}, ${url}, ${meldungszeitpunkt}, ${ownId})", ereignis)
                    .then(function (data) {
                        setUpSummaryFromApi(ereignis.id, ereignis.kategorie);
                    }).catch(dbHelper.onError);
            }

        }).catch(dbHelper.onError);
};


function setUpSummaryFromApi (ereignisId, typ) {
    var addSum = function (id, text) {
        db.none("UPDATE ereignis_content SET shortdescription = $1 WHERE id = $2", [text, id]).catch(dbHelper.onError);
    };

    if (typ == "ZEITUNGSARTIKEL"){
        //TODO uncomment when API is finished
        /*RestApi.getSumArticles(ereignisId, function (data) {
           addSum(ereignisId,data[0].zusammenfassung);
        });*/
    }else{
        RestApi.getSumReports(ereignisId, function (data) {
            addSum(ereignisId,data[0].zusammenfassung);
        });
    }
};
