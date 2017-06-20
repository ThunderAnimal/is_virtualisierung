/**
 * Created by InSane on 31.05.2017.
 */

var db = require('../moduls/databaseManager');
var dbHelper = require("../moduls/databaseHelper");
var RestApi = require("../moduls/restApiManager");
var calcCoords = require("../moduls/calcCoords");
var uuid = require("uuid");

exports.addEreignis = function (ereignis, callback) {
    //Ereignisse ohne Adresse nicht Aufnehmen
    if (ereignis.adresse == ""){
        callback();
        return;
    }
    var func_createEreignis = function (){
        var id = uuid.v4();
        ereignis.ownId = id;
        db.none("INSERT INTO ereignis(id, typ) VALUES ($1, $2)", [id, ereignis.kategorie]).catch(dbHelper.onError);
    };

    var func_createContent = function (){
        db.none("INSERT INTO ereignis_content(id, titel, description, bezirk, adresse, url, zeitpunkt, ereignisid) " +
            "VALUES(${id}, ${titel}, ${inhalt}, ${bezirk}, ${adresse}, ${url}, ${meldungszeitpunkt}, ${ownId})", ereignis)
            .then(function (data) {
                setUpCoords(ereignis.ownId, ereignis.adresse);
                setUpSummaryFromApi(ereignis.id, ereignis.kategorie);
                if (typeof callback == 'function'){
                    callback();
                }

            }).catch(function(error){dbHelper.onError(error);callback()});
    };


    db.oneOrNone("SELECT EXISTS(SELECT 1 FROM ereignis_content WHERE id=$1)", ereignis.id)
        .then(function (data) {
            if (data.exists){
                callback();
                return
            }

            if(ereignis.DuplicateIDs == undefined){
                func_createEreignis();
                func_createContent();
            }
            else{
                if (ereignis.DuplicateIDs.length == 0){
                    func_createEreignis();
                    func_createContent();
                }else{ //id von einem Duplicate ermitteln
                    db.any('SELECT * FROM ereignis_content WHERE id in ($1:csv)', [ereignis.DuplicateIDs])
                        .then(function (data) {
                            if (data.length == 0){
                                func_createEreignis();
                                func_createContent();
                            }else{
                                ereignis.ownId = data[0].ereignisid;
                                func_createContent();
                            }
                        }).catch(dbHelper.onError);
                }
            }

        }).catch(dbHelper.onError);
};


function setUpCoords(eriegnisId, adresse) {
    calcCoords.initData(function () {
        var arryAdrss = adresse.split(',', 2);
        var coords = calcCoords.getCoords(arryAdrss[0], arryAdrss[1]); //TODO liefert zur Zeit oft undefined zurueck, habe ihc daher angepasst
        if (coords){
            db.none("UPDATE ereignis SET lon = $1, lat = $2 WHERE id=$3", [coords.longitude, coords.latitude, eriegnisId]).catch(dbHelper.onError);
        }else{
            console.log(adresse + " nicht gefunden");
        }
    });
}

function setUpSummaryFromApi (id, typ) {
    var addSum = function (id, text) {
        db.none("UPDATE ereignis_content SET shortdescription = $1 WHERE id = $2", [text, id]).catch(dbHelper.onError);
    };

    if (typ == "ZEITUNGSARTIKEL"){
        //TODO uncomment when API is finished
        /*RestApi.getSumArticles(ereignisId, function (data) {
           addSum(ereignisId,data[0].zusammenfassung);
        });*/
    }else{
        RestApi.getSumReports(id, function (data) {
            addSum(id,data[0].zusammenfassung);
        });
    }
};
