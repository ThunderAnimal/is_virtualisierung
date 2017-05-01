var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'IS Virtualisierung' });
});

/* Get Impressum Page */
router.get('/impressum', function(req, res, next) {
  res.render('impressum', { title: 'Impressum - IS Virtualisierung' });
});

module.exports = router;
