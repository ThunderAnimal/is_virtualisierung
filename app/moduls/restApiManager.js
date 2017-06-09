/**
 * Created by InSane on 08.05.2017.
 */
request = require('request-json');

var confApi = require('../../config/restApi');
var client = request.createClient(confApi.uri);

exports.getArticles = function(page, callback){
    client.get('articles?page=' + page, function(err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(body);
        } else {
            console.error(err);
        }
    });
};

exports.getReports = function(page, callback){
    client.get('reports?page=' + page, function(err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(body);
        } else {
            console.error(err);
        }
    });
};

exports.getPoi = function(page, callback){
    callback();
};

exports.getArticlesPages = function(callback){
    client.get('articles_pages/', function(err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(body.pages);
        }else{
            console.error(err);
        }
    });
};

exports.getReportPages = function(callback){
    client.get('reports_pages/', function(err, res, body) {
         if (!err && res.statusCode == 200) {
             callback(body.pages);
         }else{
             console.error(err);
         }
     });
};
