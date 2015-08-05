/**
 * Created by ssingh on 7/29/15.
 */
var express = require('express');
var connect = require('connect');
var path = require('path');
var http = require('http');
var app = express();

// all environments
app.set('port', process.env.PORT || 3010);
app.use(connect.compress());
app.set('views', path.join(__dirname, '../client/views'));
app.use(express.static(path.join(__dirname, '../client/views')));
app.use(express.static(path.join(__dirname, '../client')));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.urlencoded());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
var yelpData = require('/Users/ssingh/WebstormProjects/neighborhoodmap/server/source/js/yelp_search.js');

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', function(req, res) {
    res.sendfile('client/views/index.views');
});

app.get('/heartbeat', function(req, res) {
    res.send();
});

app.get('/yelpData', function (req, res) {
    return yelpData.getSearchData(req, res);
});

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});