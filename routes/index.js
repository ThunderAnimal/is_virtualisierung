var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'IS Visualisierung' });
});

/* Get Impressum Page */
router.get('/impressum', function(req, res, next) {
  res.render('impressum', { title: 'Impressum - IS Visualisierung' });
});

module.exports = router;
