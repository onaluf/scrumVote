'use strict';

/**
 * Module dependencies.
 */

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var fs = require('fs');
var path = require('path');
//add your api items here - see app.get below
var sample = require('./api/sample')(io);


// all environments
app.set('port', process.env.PORT || 3000);
//app.set('views', __dirname + '/views');
//app.set('view engine', 'jshtml');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
//app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//app.engine('jshtml', require('jshtml-express'));
//app.set('view engine', 'jshtml');

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res) {
    fs.readFile(__dirname + '/public/index.html', 'utf8', function(err, text){
        res.send(text);
    });
});

app.get('/api/sample', sample.get);

server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});


io.on('connection', function (socket) {
    socket.on('room', function (room) {
        socket.join(room);
        
        socket.on('newVoter', function (voter) {
            console.log('new voter called ' + voter.name + ' registered on vote ' + room);
            socket.in(room).broadcast.emit('newVoter', voter);
            
            socket.on('vote', function (vote) {
                socket.in(room).broadcast.emit('vote', vote);
            });
            
            socket.on('disconnect', function () {
                socket.in(room).broadcast.emit('leaveVoter', voter);
            });
        });
        
        socket.on('startVote', function(vote) {
            socket.in(room).broadcast.emit('startVote', vote);
        });
        
        socket.on('endVote', function() {
            socket.in(room).broadcast.emit('endVote');
        });
    });
});