/**
 * Created by martin_w on 09.05.2017.
 */
var RestManager = require('./moduls/restApiManager');
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
