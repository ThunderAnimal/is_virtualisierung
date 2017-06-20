/**
 * Created by martin_w on 09.05.2017.
 */
var RestManager = require('./moduls/restApiManager');
var EreignisManager = require('./moduls/EreignisManager');
var PoIManager = require('./moduls/PoiManager');

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

exports.deleteEmptyAdresse = function(callback){
    //TODO Datenbank durchgehen und pruefen ob adresse gefuellt ist, wenn nicht dann adresse Ereignis loeschen
    console.log("Delete Content Without Adress");
    callback();
};

exports.deletePoIWithoutName = function (callback) {
    //TODO Datenbank durchgehen und pruefen ob name gefuellt, wenn nicht dann Poi loeschen
    console.log("Delete PoI Without Name");
};

exports.calcCoords = function(callback){
    //TODO Datenbak durchgehen und prufen ob koordinaten gefuellt sind, wenn nicht dann úber die adresse die Koordinaten ermitteln
    console.log("Calc Coords");
    callback();
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
                for(var i = 0; i < dataList.length; i++){
                    EreignisManager.addEreignis(dataList[i]);
                }
                rekGetArticles(currentPage + 1);
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
               for(var i = 0; i < dataList.length; i++){
                   EreignisManager.addEreignis(dataList[i]);
               }
               rekGetReports(currentPage + 1);
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
        }
        PoIManager.initData(function () {
            console.log("Fill PoI:");
            PoIManager.fillData(callback);
        });
    });
}
