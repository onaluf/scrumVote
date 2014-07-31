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
var _ = require('lodash');
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

// current room status
var votes = {};

io.on('connection', function (socket) {

    socket.on('room', function (room) {

        socket.join(room);
        if(!votes[room]) {
            votes[room] = {
                story: 'LBK-000',
                voters: []
            };
        }

        socket.emit('currentVote', votes[room]);

        socket.on('newVoter', function (voter) {
            console.log('new voter called ' + voter.name + ' registered on vote ' + room);
            // socket.in(room).broadcast.emit('newVoter', voter);
            if(!_.find(votes[room].voters, { 'id': voter.id })) {
                votes[room].voters.push(voter);
                socket.in(room).broadcast.emit('currentVote', votes[room]);
            }
            
            socket.on('vote', function (vote) {
                socket.in(room).broadcast.emit('vote', vote);
            });
            
            socket.on('disconnect', function () {
                leave(socket, room, voter);
            });
        });
        
        socket.on('leaveVoter', function (voter) {
            socket.in(room).broadcast.emit('leaveVoter', voter);
            leave(socket, room, voter);
        });
        
        socket.on('startVote', function(vote) {
            votes[room].inprogress = true;
            socket.in(room).broadcast.emit('startVote', vote);
        });
        
        socket.on('endVote', function() {
            votes[room].inprogress = false;
            socket.in(room).broadcast.emit('endVote');
            socket.in(room).broadcast.emit('currentVote', votes[room]);
        });
    });
});

var leave = function(socket, room, voter) {
    _.remove(votes[room].voters, { 'id': voter.id });
    console.log('leave ', votes[room], room);
    socket.in(room).broadcast.emit('currentVote', votes[room]);
}