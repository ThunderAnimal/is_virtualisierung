/**
 * Created by InSane on 08.05.2017.
 */
request = require('request-json');

var confApi = require('../../config/restApi');
//TODO Umstyellung auf API von Gruppe 3
var clientContent = request.createClient(confApi.content.uri);
var clientSummary = request.createClient(confApi.summary.uri);
var clientGeoCoords = request.createClient(confApi.geoCoords.uri);
var clientDubletten = request.createClient(confApi.dubletten.uri);

exports.getArticles = function(page, callback){
    clientDubletten.get('/filteredArticles/page/' + page, function(err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(body);
        } else {
            console.error(err);
            callback(null);
        }
    });
};

exports.getReports = function(page, callback){
    clientContent.get('reports?page=' + page, function(err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(body);
        } else {
            console.error(err);
            callback(null);
        }
    });
};

exports.getArticlesPages = function(callback){
    clientDubletten.get('filteredArticles/pages', function(err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(body.pages);
        }else{
            console.error(err);
            callback(null);
        }
    });
};

exports.getReportPages = function(callback){
    clientContent.get('reports_pages/', function(err, res, body) {
         if (!err && res.statusCode == 200) {
             callback(body.pages);
         }else{
             console.error(err);
             callback(null);
         }
     });
};

exports.getSumArticles = function (id, callback) {
    clientSummary.get('articles?id=' + id,  function(err, res, body){
        if (!err && res.statusCode == 200) {
            callback(body);
        } else {
            console.error(err);
            callback(null);
        }
    });
};

exports.getSumReports = function (id, callback) {
    clientSummary.get('reports?id=' + id,  function(err, res, body){
        if (!err && res.statusCode == 200) {
            callback(body);
        } else {
            console.error(err);
            callback(null);
        }
    });
};

exports.getGeoCoords = function (adresse, callback) {
    var query = encodeURI(adresse);
    clientGeoCoords.get('?format=json&addressdetails=1&limit=1&q=' + query, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(body);
        } else {
            console.error(err);
            callback(null);
        }
    });
};