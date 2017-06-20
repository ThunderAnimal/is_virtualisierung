/**
 * Created by InSane on 08.05.2017.
 */
request = require('request-json');

var confApi = require('../../config/restApi');
//TODO Umstyellung auf API von Gruppe 3
var clientContent = request.createClient(confApi.content.uri);
var clientSummary = request.createClient(confApi.summary.uri);

exports.getArticles = function(page, callback){
    clientContent.get('articles?page=' + page, function(err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(body);
        } else {
            console.error(err);
        }
    });
};

exports.getReports = function(page, callback){
    clientContent.get('reports?page=' + page, function(err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(body);
        } else {
            console.error(err);
        }
    });
};

exports.getArticlesPages = function(callback){
    clientContent.get('articles_pages/', function(err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(body.pages);
        }else{
            console.error(err);
        }
    });
};

exports.getReportPages = function(callback){
    clientContent.get('reports_pages/', function(err, res, body) {
         if (!err && res.statusCode == 200) {
             callback(body.pages);
         }else{
             console.error(err);
         }
     });
};

exports.getSumArticles = function (id, callback) {
    clientSummary.get('articles?id=' + id,  function(err, res, body){
        if (!err && res.statusCode == 200) {
            callback(body);
        } else {
            console.error(err);
        }
    });
};

exports.getSumReports = function (id, callback) {
    clientSummary.get('reports?id=' + id,  function(err, res, body){
        if (!err && res.statusCode == 200) {
            callback(body);
        } else {
            console.error(err);
        }
    });
};
