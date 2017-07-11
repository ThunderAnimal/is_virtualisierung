/**
 * Created by InSane on 31.05.2017.
 */

var db = require('../moduls/databaseManager');
var dbHelper = require("../moduls/databaseHelper");
var calcCoords = require("../moduls/calcCoords");
var RestApi = require("./restApiManager");
var uuid = require("uuid");

exports.addReport = function (report, callback) {
    addEreignis(report, callback);
};
exports.addArticle = function (article, callback) {
    if (article.ereigniszeitpunkt == "" || article.ereigniszeitpunkt == undefined){
        article.ereigniszeitpunkt = article.meldungszeitpunkt;
    }
    addEreignis(article, callback);
};

function addEreignis (ereignis, callback) {
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
            "VALUES(${id}, ${titel}, ${inhalt}, ${bezirk}, ${adresse}, ${url}, ${ereigniszeitpunkt}, ${ownId})", ereignis)
            .then(function (data) {
                setUpCoords(ereignis.ownId, ereignis.adresse, function () {
                    setUpSummaryFromApi(ereignis.id, ereignis.kategorie, function () {
                        if (typeof callback == 'function'){
                            callback();
                        }
                    });    
                });
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
                        }).catch(function(error){dbHelper.onError(error);callback()});
                }
            }

        }).catch(function(error){dbHelper.onError(error);callback()});
};

exports.addCoords = function (callback) {
    db.any("SELECT ereignis.id, ereignis_content.adresse FROM ereignis_content, ereignis WHERE ereignis_content.ereignisid = ereignis.id AND ereignis.lat IS NULL")
        .then(function (data) {
            var rekaddCoords = function (pos) {
                if (pos >= data.length){
                    callback();
                    return;
                }

                setUpCoords(data[pos].id, data[pos].adresse, function () {
                    rekaddCoords(pos + 1);
                });
            };
            rekaddCoords(0);
        })
        .catch(function (error) {
           dbHelper.onError(error);
            callback();
        });
};

exports.addSummary = function(callback){
    db.any("SELECT ereignis_content.id, ereignis.typ FROM ereignis_content, ereignis WHERE ereignis_content.ereignisid = ereignis.id AND (shortdescription IS NULL OR shortdescription = '')")
        .then(function (data) {
           var rekaddSummary = function (pos) {
               if (pos >= data.length){
                   callback();
                   return;
               }
               setUpSummaryFromApi(data[pos].id, data[pos].typ,  function () {
                   rekaddSummary(pos + 1);
               });
           };
            rekaddSummary(0);
        })
        .catch(function(error){
            dbHelper.onError(error);
            callback();
        });
};

exports.getItemContent = function(ereignisId, callback) {
    db.manyOrNone("SELECT id, titel, shortdescription, adresse, url, zeitpunkt FROM ereignis_content WHERE ereignisid=$1", ereignisId)
        .then(function (data) {
            callback(data);
        }).catch(function (error) {
            dbHelper.onError(error);
            callback(undefined);
        });
};

var cacheMissCoordsList = [];
function setUpCoords(eriegnisId, adresse, callback) {
    //System beschleunigen fuer Adressen die nicht gefunden wurden
    for (var i = 0; i < cacheMissCoordsList.length;i++){
        if (adresse == cacheMissCoordsList[i]){
            callback();
            return;
        }
    }

    calcCoords.initData(function () {
        calcCoords.getCoords(adresse, function (coords) {
            if (!coords){
                cacheMissCoordsList.push(adresse);
                console.log("Adresse: " + adresse + " konnte nicht geocodiert werden.");
            }
            else{
                db.none("UPDATE ereignis SET lon = $1, lat = $2 WHERE id=$3", [coords.lon, coords.lat, eriegnisId]).catch(dbHelper.onError);
            }

            callback();
        });
    });
}

function setUpSummaryFromApi (id, typ, callback) {
    var addSum = function (id, text) {
        db.none("UPDATE ereignis_content SET shortdescription = $1 WHERE id = $2", [text, id]).catch(dbHelper.onError);
    };

    if (typ == "ZEITUNGSARTIKEL"){
        RestApi.getSumArticles(id, function (data) {
            if (data[0]){
                addSum(id,data[0].zusammenfassung);
            }
            callback();
        });
    }else{
        RestApi.getSumReports(id, function (data) {
            if (data[0]){
                addSum(id,data[0].zusammenfassung);
            }
            callback();
        });
    }
};