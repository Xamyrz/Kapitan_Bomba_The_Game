const express = require('express');
var app = express();
var router = express.Router();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
router.get('/', function (req, res, next) {
    res.render('index');
});

module.exports = router;