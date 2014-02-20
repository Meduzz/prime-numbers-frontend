
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var uuid = require("uuid");
var ctx = require("rabbit.js").createContext();
var sub = null;
var pub = null;

var app = express();
http = http.createServer(app);
var io = require("socket.io").listen(http);

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
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

io.sockets.on('connection', function(socket){
	socket.on('in', function(data){
		var key = uuid.v4();
		data.key = key;
		console.log(data);
		
		sub = ctx.socket("SUB");
		sub.connect({exchange:"test", topic:key, routing:"direct"}, function() {
			// dont write until we're connected.
			pub.write(JSON.stringify(data), 'utf-8');
		});
		sub.setEncoding('utf-8');

		sub.on('data', function(outData){
			outData = JSON.parse(outData);

			socket.emit('out', outData.number);
		});
	});
});

app.get('/', routes.index);

http.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

ctx.on('ready', function() {
	pub = ctx.socket("PUB");

	pub.connect({exchange:"test", topic:"in", routing:"direct"});
});
