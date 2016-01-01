// server.js

// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8082;
//var request = require('request');
var session = require('client-sessions');




app.configure(function() {

	// set up our express application
	app.use(express.logger('dev')); 
	app.use(express.cookieParser()); 
	app.use(express.bodyParser());
	app.use(session({
		cookieName: 'session',
		secret: 'random_string_goes_here',
		duration: 30 * 60 * 1000,
		activeDuration: 5 * 60 * 1000
	}));

	app.set('view engine', 'ejs');

});

// routes ======================================================================
require('./app/routes.js')(app); // the main login to route

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
