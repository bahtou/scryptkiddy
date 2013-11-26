"use strict";
var express = require('express')
  , app = express()
  , Mongo = require('mongodb').MongoClient
  , dbpath = 'mongodb://localhost:27017/test'
  , db;

var routes = require('./routes')
  , http = require('http')
  , path = require('path');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
app.configure('development', function() {
  app.use(express.errorHandler({showStack: true, dumpExceptions: true}));
  app.locals.pretty = true;
});

// connect Mongo
Mongo.connect(dbpath, function(err, db) {
  if (err) throw err;
  routes(app, db);
});


http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
