/**
 * Created by martin_w on 09.05.2017.
 */
var express = require('express');
var router = express.Router();

var ereignisManager = require('../app/moduls/EreignisManager');
var poiManager = require('../app/moduls/PoiManager');
var dataManager = require('../app/dataManager');

/* REST API  */
router.get('/filldata', function(req, res, next) {
    res.send('fill Data... i takes a long time');
    dataManager.exec(function () {
        console.log("Verarbeitung beendet!");
    });
});

router.get('/markers', function (req, res) {
    dataManager.queryMarkers(req.query, function (markers) {
        res.send({markers: markers});
    });
});

router.get('/ereignis/:id', function (req, res) {
    ereignisManager.getItemContent(req.params.id, function(data) {
        res.send(data);
    });
});
router.get('/denkmal/:id', function (req, res) {
    poiManager.getItemContent(req.params.id, function (data) {
       res.send(data);
    });
});
module.exports = router;