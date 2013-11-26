"use strict";
var scrypt = require('scrypt')
  , maxtime = 0.1 //100 milliseconds
  , maxmem = 0, maxmemfrac = 0.5;

module.exports = exports = function(app, db) {

  app.get('/', function(req, res) {
    res.redirect('/signup');
    return;
  });

  app.get('/signup', function(req, res) {
    res.render('signup');
    return;
  });

  app.post('/signup', function(req, res) {
    var Email = req.body.Email;
    var Passwd = req.body.Passwd;

    scrypt.passwordHash(Passwd, maxtime, maxmem, maxmemfrac, function(err, pwdHash) {
      if (err) throw err;

      insertUser(db, Email, pwdHash, function(err) {
        if (err) throw err;
        console.log('redirecting to login');
        res.redirect('/login');
        return;
      });

    });
  });

  app.get('/login', function(req, res) {
    res.render('login');
    return;
  });

  app.post('/loginAuth', function(req, res) {
    var Email = req.body.Email;
    var Passwd = req.body.Passwd;

    getUser(db, Email, function(user) {
      if (!user) {
        console.log('user not found');
        res.redirect('/login');
        return;
      }
      console.log('user found');
      verifyUser(Passwd, user, function(verified) {
        if (!verified) {
          console.log('user not verified');
          res.redirect('/login');
          return
        }
        console.log('user verified');
        res.redirect('/loggedIn');
        return;
      });

    });
  });

  app.get('/loggedIn', function(req, res) {
    res.render('index', {
      phrase: "now what?"
    });
    return;
  });

  app.get('/signout', function(req, res) {
    console.log('user signing out');
    res.redirect('/signup');
    return;
  });

};

function insertUser(db, email, pwdhash, cb) {
  var User = db.collection('users');
  User.ensureIndex({email:1}, {unique: true}, function(err, indexName) {

    User.insert({email: email, password: pwdhash}, function(err, doc) {
      if (err) return cb(err);
      
      console.log('added to database');
      User.findOne({email: email}, function(err, user) {
        if (err) return cb(err);
        console.log('User:\n', user);
        return cb(null);
      });

    });
  });
}

function getUser(db, email, cb) {
  var User = db.collection('users');
    User.ensureIndex({email:1}, {unique: true}, function(err, indexName) {
    User.findOne({email: email}, function(err, user) {
      if (err) throw err;
      return cb(user);
    });
  });
}

function verifyUser(passwd, user, cb) {
  scrypt.verifyHash(user.password, passwd, function(err, result) {
    if (!err) {
      return cb(result);
    }
    return cb(err);
  });
}