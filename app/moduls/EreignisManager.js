/**
 * Created by InSane on 31.05.2017.
 */

var db = require('../moduls/databaseManager');
var dbHelper = require("../moduls/databaseHelper");
var uuid = require("uuid");

exports.addEreignis = function (ereignis) {
    db.oneOrNone("SELECT EXISTS(SELECT 1 FROM ereignis_content WHERE id=$1)", ereignis.id)
        .then(function (data) {
            if(!data.exists){
                var id = uuid.v4();
                ereignis.ownId = id;
                db.none("INSERT INTO ereignis(id) VALUES ($1)", id).catch(dbHelper.onError);
                db.none("INSERT INTO ereignis_content(id, typ, titel, description, bezirk, adresse, url, zeitpunkt, ereignisid) " +
                        "VALUES(${id}, ${kategorie}, ${titel}, ${inhalt}, ${bezirk}, ${adresse}, ${url}, ${meldungszeitpunkt}, ${ownId})", ereignis)
                    .then(function (data) {

                    }).catch(dbHelper.onError);
            }

        }).catch(dbHelper.onError);
};

exports.setUpSummaryFromApi = function (ereignisId) {
    //TODO Implement mehtod when API is ready

};
