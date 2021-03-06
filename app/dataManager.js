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
            that.addCoords(function () {
                that.addSummary(function () {
                    callback();
                });
            });
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
exports.addCoords = function (callback) {
    console.log("Add Coords to Ereignis");
    EreignisManager.addCoords(callback);
};
exports.addSummary = function (callback) {
    console.log("Add Summary to Ereignis");
    EreignisManager.addSummary(callback);
};

exports.queryMarkers = function (queryParameters, callback) {
    //Parameters
    var maxMarkers = 2500;
    var currentYear = " '2017-01-01 00:00:00.000000' ";
    var queryTyps = [];

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

    //QueryBilder Params
    var countQuery = "";
    var groupQuery = "";
    var basicQuery = "";
    var queryInput = [];
    if (queryParameters.filterLatest){
        var queryLatest = " AND zeitpunkt  >= " + currentYear;
    }else{
        var queryLatest = "";
    }



    //UNION SQL uber Denkmal und erigenis
    if (queryParameters.filterDenkmal &&
        (queryParameters.filterPolizei || queryParameters.filterFeuerwehr || queryParameters.filterArtikel)) {
        if(queryParameters.filterPolizei){
            queryTyps.push("POLIZEI");
        }
        if (queryParameters.filterFeuerwehr){
            queryTyps.push("FEUERWEHR");
        }
        if (queryParameters.filterArtikel){
            queryTyps.push("ZEITUNGSARTIKEL");
        }

        countQuery = "SELECT count(*) FROM ( " +
            "SELECT denkmal.id FROM denkmal " +
            "WHERE lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 " +
            "UNION ALL " +
            "SELECT ereignis.id FROM ereignis_content, ereignis " +
            "WHERE ereignis_content.ereignisid=ereignis.id AND lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 AND typ in($5:csv)" + queryLatest  +
            ") as count";
        groupQuery = "SELECT bezirk, count(*) FROM ( " +
            "SELECT denkmal.bezirk FROM denkmal " +
            "WHERE lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 " +
            "UNION ALL " +
            "SELECT ereignis_content.bezirk FROM ereignis_content, ereignis " +
            "WHERE ereignis_content.ereignisid=ereignis.id AND lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 AND typ in($5:csv)" + queryLatest +
            ") as count GROUP BY bezirk";
        basicQuery = "SELECT id, lon, lat, typ FROM denkmal " +
            "WHERE lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 " +
            "UNION ALL " +
            "SELECT ereignis.id, lon, lat, typ FROM ereignis_content, ereignis " +
            "WHERE ereignis_content.ereignisid=ereignis.id AND lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 AND typ in($5:csv)" + queryLatest;
        queryInput = [queryParameters.minLon, queryParameters.maxLon, queryParameters.minLat, queryParameters.maxLat, queryTyps];
    } else if (queryParameters.filterDenkmal && //SQL nur uber Denkmal Tabelle --> Improve Performance
        !(queryParameters.filterPolizei || queryParameters.filterFeuerwehr || queryParameters.filterArtikel)) {

        countQuery = "SELECT count(*) FROM ( " +
            "SELECT id FROM denkmal " +
            "WHERE lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 " +
            ") as count";
        groupQuery = "SELECT bezirk, count(*) FROM ( " +
            "SELECT denkmal.bezirk FROM denkmal " +
            "WHERE lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 " +
            ") as count GROUP BY bezirk";
        basicQuery = "SELECT id, lon, lat, typ FROM denkmal " +
            "WHERE lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4";
        queryInput = [queryParameters.minLon, queryParameters.maxLon, queryParameters.minLat, queryParameters.maxLat];


    } else if (!queryParameters.filterDenkmal && //SQL nur Ueber ereignis Tabelle --> Improve Performance
        (queryParameters.filterPolizei || queryParameters.filterFeuerwehr || queryParameters.filterArtikel)) {
        if(queryParameters.filterPolizei){
            queryTyps.push("POLIZEI");
        }
        if (queryParameters.filterFeuerwehr){
            queryTyps.push("FEUERWEHR");
        }
        if (queryParameters.filterArtikel){
            queryTyps.push("ZEITUNGSARTIKEL");
        }

        countQuery = "SELECT count(*) FROM ( " +
            "SELECT ereignis.id FROM ereignis_content, ereignis  " +
            "WHERE ereignis_content.ereignisid=ereignis.id AND lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 AND typ in($5:csv) " + queryLatest +
            ") as count";
        groupQuery = "SELECT bezirk, count(*) FROM ( " +
            "SELECT ereignis_content.bezirk FROM ereignis_content, ereignis  " +
            "WHERE ereignis_content.ereignisid=ereignis.id AND lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 AND typ in($5:csv) " + queryLatest +
            ") as count GROUP BY bezirk";
        basicQuery = "SELECT ereignis.id, lon, lat, typ FROM ereignis_content, ereignis " +
            "WHERE ereignis_content.ereignisid=ereignis.id AND lon>=$1 AND lon<=$2 AND lat>=$3 AND lat<=$4 AND typ in($5:csv)" + queryLatest;

        queryInput = [queryParameters.minLon, queryParameters.maxLon, queryParameters.minLat, queryParameters.maxLat, queryTyps];
    }else{ //Nichts angehakt leere Liste
        callback([]);
        return;
    }

    //Query Daten
    db.any(countQuery,queryInput)
        .then(function (data) {
            //huge date --> group
            if (data[0].count > maxMarkers){
                //Pruefen wie weit rausgezommt, wenn zu weit dann dann nru ein Marker
                if ((queryParameters.minLat < 52 && queryParameters.maxLat > 53) ||
                    (queryParameters.minLon < 12 && queryParameters.maxLon > 14.5)){
                    var marker = [];
                    marker.push({
                        typ: "ZUSAMMENFASSUNG",
                        lat: "52.520007",
                        lon: "13.404953999999975",
                        anzahl: data[0].count
                    });
                    callback(marker);
                }else {
                    db.any(groupQuery, queryInput)
                        .then(function (data) {
                            func_fillZusammfassung(data, function (markers) {
                                callback(markers);
                            });
                        })
                        .catch(function (error) {
                            dbHelper.onError(error);
                            callback(undefined);
                        });
                }
            }else{
                db.any(basicQuery, queryInput)
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
};

exports.getStatistic = function (callback) {
    var colorPolizei = "#6e9d74";
    var colorFeuerwehr = "#b33e67";
    var colorZeitung = "#f1a646";
    var colorGesamt = "#444444";
    var colorDenkmalGesamt = "#5f8ce9";

    //gloab functions
    var func_getPoiBezirk = function (callback) {
        db.any("SELECT bezirk, typ, count(*) FROM ( " +
            "SELECT denkmal.bezirk, denkmal.typ FROM denkmal " +
            ") as count GROUP BY bezirk, typ ORDER BY bezirk, typ")
            .then(function (data) {
                BezirkManager.getBezirkCoorList(function (bezirkListe) {
                    statistic.poiBezirke = {};
                    var categories = [];
                    for (var i = 0; i < bezirkListe.length; i++){
                        categories.push(bezirkListe[i].name);
                    }
                    var series = [
                        {name: 'Bodendenkmal', data:[0,0,0,0,0,0,0,0,0,0,0,0]},
                        {name: 'Denkmal', data:[0,0,0,0,0,0,0,0,0,0,0,0]},
                        {name: 'Ensemble', data:[0,0,0,0,0,0,0,0,0,0,0,0]},
                        {name: 'Gesamtanlage', data:[0,0,0,0,0,0,0,0,0,0,0,0]},
                        {name: 'Gesamt', color: colorDenkmalGesamt, data:[0,0,0,0,0,0,0,0,0,0,0,0]}
                    ];
                    for (var i= 0; i < data.length; i++){
                        //serie raussuchen
                        for (var k =0; k < series.length; k++){
                            if (data[i].typ == series[k].name){
                                //Bezirk raussuchen, id in data bei seroe
                                for(var j = 0; j < categories.length; j++){
                                    if (data[i].bezirk == categories[j]){
                                        series[k].data[j] = parseInt(data[i].count); //Wert in data serie setzten
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                    for(var i = 0; i < categories.length; i++){
                        series[4].data[i] = series[0].data[i] + series[1].data[i] + series[2].data[i] + series[3].data[i];
                    }

                    statistic.poiBezirke.categories = categories;
                    statistic.poiBezirke.series = series;
                    callback();
                });

            });
    };
    var func_getReportsArticleBezirke = function (callback) {
        db.any("SELECT bezirk, typ, count(*) FROM ( " +
            "SELECT ereignis_content.bezirk, ereignis.typ FROM ereignis_content, ereignis  " +
            "WHERE ereignis_content.ereignisid=ereignis.id " +
            ") as count GROUP BY bezirk, typ ORDER BY bezirk, typ")
            .then(function (data) {
                BezirkManager.getBezirkCoorList(function (bezirkListe) {
                    statistic.reportsArticleBezirke = {};
                    var categories = [];
                    for (var i = 0; i < bezirkListe.length; i++){
                        categories.push(bezirkListe[i].name);
                    }
                    var series = [
                        {name: 'Polizei', color: colorPolizei, data:[0,0,0,0,0,0,0,0,0,0,0,0]},
                        {name: 'Feuerwehr', color: colorFeuerwehr, data:[0,0,0,0,0,0,0,0,0,0,0,0]},
                        {name: 'Zeitungsartikel', color: colorZeitung, data:[0,0,0,0,0,0,0,0,0,0,0,0]},
                        {name: 'Gesamt', color: colorGesamt, data:[0,0,0,0,0,0,0,0,0,0,0,0]}
                    ];
                    for (var i= 0; i < data.length; i++){
                        //serie raussuchen
                        for (var k =0; k < series.length; k++){
                            if (data[i].typ.toLocaleLowerCase() == series[k].name.toLocaleLowerCase()){
                                //Bezirk raussuchen, id in data bei seroe
                                for(var j = 0; j < categories.length; j++){
                                    if (data[i].bezirk == categories[j]){
                                        series[k].data[j] = parseInt(data[i].count); //Wert in data serie setzten
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                    for(var i = 0; i < categories.length; i++){
                        series[3].data[i] = series[0].data[i] + series[1].data[i] + series[2].data[i];
                    }

                    statistic.reportsArticleBezirke.categories = categories;
                    statistic.reportsArticleBezirke.series = series;
                    callback();
                });

            });
    };
    var func_getTimeline = function (callback) {
        db.any("SELECT typ, " +
            "EXTRACT(year FROM zeitpunkt) as year, " +
            "EXTRACT(month FROM zeitpunkt) as month, " +
            "count(*) FROM ( " +
            "SELECT ereignis.typ, ereignis_content.zeitpunkt FROM ereignis_content, ereignis  " +
            "WHERE ereignis_content.ereignisid=ereignis.id " +
            ") as count GROUP BY typ, year, month ORDER BY typ,  year ASC, month ASC")
            .then(function (data) {
                statistic.reportsArticleTime = {};
                var series = [
                    {name: 'Polizei', color: colorPolizei, data:[]},
                    {name: 'Feuerwehr',color:colorFeuerwehr, data:[]},
                    {name: 'Zeitungsartikel',color: colorZeitung, data:[]}
                ];
                for (var i = 0; i <data.length; i ++){
                    for (var k = 0; k<series.length; k++){
                        if (data[i].typ.toLocaleLowerCase() == series[k].name.toLocaleLowerCase()){
                            series[k].data.push([Date.UTC(parseInt(data[i].year), parseInt(data[i].month) - 1, 31), parseInt(data[i].count)]);
                        }
                    }
                }
                statistic.reportsArticleTime.series = series;
                callback();
            });
    };

    var statistic = {};
    func_getPoiBezirk(function (){
        func_getReportsArticleBezirke(function () {
            func_getTimeline(function () {
                callback(statistic);
            });
        })
    });



};

function fillDataArticles(callback){
    console.log("Fill Articles:");
    RestManager.getArticlesPages(function(pages){
        if (!pages){
            console.error("Fehler bei Abfrage der Artikel Seiten");
            callback();
            return;
        }
        var rekGetArticles = function (currentPage){
            if(currentPage > pages){
                callback();
                return;
            }
            console.log("get Articles Page: " + currentPage + "/" + pages);
            RestManager.getArticles(currentPage, function (dataList) {
                if (!dataList){
                    console.error("Fehler bei Abfrage der Artikel");
                    callback();
                    return;
                }

                var rekAddEriegnis = function (currentItem) {
                    if (currentItem >= dataList.length){
                        rekGetArticles(currentPage + 1);
                        return;
                    }
                    EreignisManager.addArticle(dataList[currentItem], function () {
                        rekAddEriegnis(currentItem + 1);
                    });
                };
                rekAddEriegnis(0);
            });
        };
        rekGetArticles(0);
    });
}
function fillDateReports(callback){
    console.log("Fill Reports:");
    RestManager.getReportPages(function(pages){
        if (!pages){
            console.error("Fehler bei Abfrage der Reports Seiten");
            callback();
            return;
        }
       var rekGetReports = function(currentPage){
           if(currentPage > pages){
               callback();
               return;
           }

           console.log("get Reports Page: " + currentPage + "/" + pages);
           RestManager.getReports(currentPage, function (dataList) {
               if (!dataList){
                   console.error("Fehler bei Abfrage der Reports");
                   callback();
                   return;
               }
               var rekAddEriegnis = function (currentItem) {
                   if (currentItem >= dataList.length){
                       rekGetReports(currentPage + 1);
                       return;
                   }
                   EreignisManager.addReport(dataList[currentItem], function () {
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
