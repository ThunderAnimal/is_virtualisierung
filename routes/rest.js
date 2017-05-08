/**
 * Created by martin_w on 09.05.2017.
 */
var express = require('express');
var router = express.Router();

var dataManager = require('../app/dataManager');

/* REST API  */
router.get('/filldata', function(req, res, next) {
    res.send('fill Data... i takes a long time');
    dataManager.fillData(function(){
        console.log("finish");
    });
});

module.exports = router;