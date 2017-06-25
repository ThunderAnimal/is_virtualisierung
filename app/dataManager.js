/**
 * Created by martin_w on 09.05.2017.
 */
var db = require('./moduls/databaseManager');
var dbHelper = require("./moduls/databaseHelper");


var RestManager = require('./moduls/restApiManager');
var BezirkManager = require('./moduls/BezirkManager');
var EreignisManager = require('./moduls/EreignisManager');
var PoIManager = require('./moduls/PoiManager');

exports.exec = function (callback) {
    var that = this;
    that.fillData(function(){
        that.deletePoIWithoutName(function(){
            callback();
        });
    });
};

exports.fillData = function(callback){
    console.log("Fill Data:");
    fillDataArticles(function(){
        fillDateReports(function(){
            fillDataPoI(function(){
                callback();
            });
        });
    });
};

exports.deletePoIWithoutName = function (callback) {
    //Datenbank durchgehen und pruefen ob name gefuellt, wenn nicht dann Poi loeschen
    console.log("Delete PoI Without Name");
    PoIManager.deleteDataWithputName(callback);
};

exports.queryMarkers = function (queryParameters, callback) {
    //Parameters
    var maxMarkers = 2500;


    //gloab functions
    var func_fillZusammfassung = function(data, callback){
        var markers = [];
        BezirkManager.getBezirkCoorList(function (bezirke) {
            for(var i=0; i <data.length; i++){
               for (var j=0; j<bezirke.length;j++){
                   if (data[i].bezirk == bezirke[j].name){
                       markers.push({
                           typ: "ZUSAMMENFASSUNG",
                           lat: bezirke[j].lat,
                           lon: bezirke[j].lon,
                           anzahl: data[i].count
                       });
                       break;
                   }
               }
            }
            callback(markers);
        });
    };
    
    //Pasring QueryParameter
    queryParameters.minLat = parseFloat(queryParameters.minLat);
    queryParameters.maxLat = parseFloat(queryParameters.maxLat);
    queryParameters.minLon = parseFloat(queryParameters.minLon);
    queryParameters.maxLon = parseFloat(queryParameters.maxLon);
    queryParameters.filterDenkmal = (queryParameters.filterDenkmal == 'true');
    queryParameters.filterPolizei = (queryParameters.filterPolizei == 'true');
    queryParameters.filterFeuerwehr = (queryParameters.filterFeuerwehr == 'true');
    queryParameters.filterArtikel = (queryParameters.filterArtikel == 'true');
    queryParameters.filterLatest = (queryParameters.filterLatest == 'true');
    //UNION SQL uber Denkmal und erigenis
    
    if (queryParameters.filterDenkmal &&
        (queryParameters.filterPolizei || queryParameters.filterFeuerwehr || queryParameters.filterArtikel)) {
        var queryTyps = []
        if(queryParameters.filterPolizei){
            queryTyps.push("POLIZEI");
        }
        if (queryParameters.filterFeuerwehr){
            queryTyps.push("FEUERWEHR");
        }
        if (queryParameters.filterArtikel){
            queryTyps.push("ZEITUNGSARTIKEL");
        }
        db.any("SELECT count(*) FROM ( " +
            "SELECT id " +
            "FROM denkmal " +
            "WHERE lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 " +
            "UNION ALL " +
            "SELECT id " +
            "FROM ereignis " +
            "WHERE lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 AND typ in($5:csv) " +
            ") as count", [queryParameters.minLon, queryParameters.maxLon, queryParameters.minLat, queryParameters.maxLat, queryTyps])
            .then(function (data) {
                if (data[0].count > maxMarkers){
                    db.any("SELECT bezirk, count(*) FROM ( " +
                        "SELECT denkmal.bezirk " +
                        "FROM denkmal WHERE lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 " +
                        "UNION ALL " +
                        "SELECT ereignis_content.bezirk " +
                        "FROM ereignis_content, ereignis  WHERE ereignis_content.ereignisid=ereignis.id AND lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 AND typ in($5:csv) " +
                        ") as count " +
                        "GROUP BY bezirk", [queryParameters.minLon, queryParameters.maxLon, queryParameters.minLat, queryParameters.maxLat, queryTyps])
                        .then(function (data) {
                            func_fillZusammfassung(data,  function (markers) {
                                callback(markers);
                            });
                        })
                        .catch(function (error) {
                            dbHelper.onError(error);
                            callback(undefined);
                        });
                }else{
                    db.any("SELECT id, lon, lat, typ " +
                        "FROM denkmal WHERE lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 " +
                        "UNION ALL " +
                        "SELECT id, lon, lat, typ " +
                        "FROM ereignis WHERE lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 AND typ in($5:csv)", [queryParameters.minLon, queryParameters.maxLon, queryParameters.minLat, queryParameters.maxLat, queryTyps])
                    .then(function (data) {
                        callback(data);
                    })
                    .catch(function (error) {
                        dbHelper.onError(error);
                        callback(undefined);
                    });
                }
            })
            .catch(function (error) {
                dbHelper.onError(error);
                callback(undefined);
            });


        //SQL nur uber Denkmal Tabelle
    } else if (queryParameters.filterDenkmal &&
        !(queryParameters.filterPolizei || queryParameters.filterFeuerwehr || queryParameters.filterArtikel)) {
        
        db.any("SELECT count(*) FROM ( " +
            "SELECT id " +
            "FROM denkmal " +
            "WHERE lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 " +
            ") as count", [queryParameters.minLon, queryParameters.maxLon, queryParameters.minLat, queryParameters.maxLat])
            .then(function (data) {
                if (data[0].count > maxMarkers){
                    db.any("SELECT bezirk, count(*) FROM ( " +
                        "SELECT denkmal.bezirk " +
                        "FROM denkmal WHERE lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 " +
                        ") as count " +
                        "GROUP BY bezirk", [queryParameters.minLon, queryParameters.maxLon, queryParameters.minLat, queryParameters.maxLat])
                        .then(function (data) {
                            func_fillZusammfassung(data,  function (markers) {
                                callback(markers);
                            });
                        })
                        .catch(function (error) {
                            dbHelper.onError(error);
                            callback(undefined);
                        });
                }else{
                    db.any("SELECT id, lon, lat, typ " +
                        "FROM denkmal WHERE lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 ", 
                        [queryParameters.minLon, queryParameters.maxLon, queryParameters.minLat, queryParameters.maxLat])
                        .then(function (data) {
                            callback(data);
                        })
                        .catch(function (error) {
                            dbHelper.onError(error);
                            callback(undefined);
                        });
                }
            })
            .catch(function (error) {
                dbHelper.onError(error);
                callback(undefined);
            });
        
        //SQL nur Ueber ereignis Tabelle
    } else if (!queryParameters.filterDenkmal &&
        (queryParameters.filterPolizei || queryParameters.filterFeuerwehr || queryParameters.filterArtikel)) {
        var queryTyps = [];
        if(queryParameters.filterPolizei){
            queryTyps.push("POLIZEI");
        }
        if (queryParameters.filterFeuerwehr){
            queryTyps.push("FEUERWEHR");
        }
        if (queryParameters.filterArtikel){
            queryTyps.push("ZEITUNGSARTIKEL");
        }
        db.any("SELECT count(*) FROM ( " +
            "SELECT id " +
            "FROM ereignis " +
            "WHERE lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 AND typ in($5:csv) " +
            ") as count", [queryParameters.minLon, queryParameters.maxLon, queryParameters.minLat, queryParameters.maxLat, queryTyps])
            .then(function (data) {
                if (data[0].count > maxMarkers){
                    db.any("SELECT bezirk, count(*) FROM ( " +
                        "SELECT ereignis_content.bezirk " +
                        "FROM ereignis_content, ereignis  WHERE ereignis_content.ereignisid=ereignis.id AND lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 AND typ in($5:csv) " +
                        ") as count " +
                        "GROUP BY bezirk", [queryParameters.minLon, queryParameters.maxLon, queryParameters.minLat, queryParameters.maxLat, queryTyps])
                        .then(function (data) {
                            func_fillZusammfassung(data,  function (markers) {
                                callback(markers);
                            });
                        })
                        .catch(function (error) {
                            dbHelper.onError(error);
                            callback(undefined);
                        });
                }else{
                    db.any("SELECT id, lon, lat, typ " +
                        "FROM ereignis WHERE lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 AND typ in($5:csv)", [queryParameters.minLon, queryParameters.maxLon, queryParameters.minLat, queryParameters.maxLat, queryTyps])
                        .then(function (data) {
                            callback(data);
                        })
                        .catch(function (error) {
                            dbHelper.onError(error);
                            callback(undefined);
                        });
                }
            })
            .catch(function (error) {
                dbHelper.onError(error);
                callback(undefined);
            });

        //Nichts angehakt leere Liste
    }else{
        callback([])
    }


};

function fillDataArticles(callback){
    console.log("Fill Articles:");
    RestManager.getArticlesPages(function(pages){
        var rekGetArticles = function (currentPage){
            if(currentPage > pages){
                callback();
                return;
            }
            console.log("get Articles Page: " + currentPage + "/" + pages);
            RestManager.getArticles(currentPage, function (dataList) {
                var rekAddEriegnis = function (currentItem) {
                    if (currentItem >= dataList.length){
                        rekGetArticles(currentPage + 1);
                        return;
                    }
                    EreignisManager.addEreignis(dataList[currentItem], function () {
                        rekAddEriegnis(currentItem + 1);
                    });
                };
                rekAddEriegnis(0);
            });
        };
        rekGetArticles(1);
    });
}
function fillDateReports(callback){
    console.log("Fill Reports:");
    RestManager.getReportPages(function(pages){
       var rekGetReports = function(currentPage){
           if(currentPage > pages){
               callback();
               return;
           }

           console.log("get Reports Page: " + currentPage + "/" + pages);
           RestManager.getReports(currentPage, function (dataList) {
               var rekAddEriegnis = function (currentItem) {
                   if (currentItem >= dataList.length){
                       rekGetReports(currentPage + 1);
                       return;
                   }
                   EreignisManager.addEreignis(dataList[currentItem], function () {
                       rekAddEriegnis(currentItem + 1);
                   });
               };
               rekAddEriegnis(0);
           });
       };
        rekGetReports(1);
    });
}
function fillDataPoI(callback){
    PoIManager.existsData(function (exists) {
        //Wird nur einmalig gefuellt, pruefen ob gefuellt wenn nicht fuellen
        if(exists){
            console.log("Denkmal Tabelle ist schon gefuellt!");
            callback();
            return;
        }
        PoIManager.initData(function () {
            console.log("Fill PoI:");
            PoIManager.fillData(callback);
        });
    });
}
