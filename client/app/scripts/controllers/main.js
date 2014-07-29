'use strict';

angular.module('clientApp')
    .controller('MonitorCtrl', function ($scope, $http, $route, $location, socket) {
        
        var voteCounter = 0;
        $scope.voteId = $route.current.params.id;
        $scope.voterUrl = window.location.origin + '/#/voter/' + $scope.voteId;
        $scope.voting = false;
        $scope.voteOver = false;
        $scope.voters = [];
        
        socket.on('connect', function() {
           socket.emit('room', $scope.voteId);
        });
        
        socket.on('newVoter', function(voter){
            $scope.voters.push(voter);
        });
        
        socket.on('leaveVoter', function(voter){
            var index = $scope.voters.indexOf(voter);
            $scope.voters.splice(index, 1);
        });
        
        socket.on('vote', function (vote) {
            $scope.votes[vote.vote].push(vote.name);
            if($scope.votes.S.length + $scope.votes.M.length + $scope.votes.L.length +$scope.votes.XL.length + $scope.votes.XXL.length === $scope.voters.length) {
                socket.emit('endVote');
                $scope.voteOver = true;
                $scope.voting = false;
            }
        });
        
        $scope.startVote = function () {
            socket.emit('startVote', voteCounter++);
            $scope.voting = true;
            $scope.voteOver = false;
            $scope.votes = {
                S: [],
                M: [],
                L: [],
                XL: [],
                XXL: [],
            };
        };
    })
    .controller('VoterCtrl', function ($scope, $http, $route, socket) {
        $scope.voteId = $route.current.params.id;
        $scope.registered = false;
        $scope.voteStarted = false;
        
        socket.on('connect', function() {
            socket.emit('room', $scope.voteId);
            
            socket.on('startVote', function() {
                $scope.voteStarted = true;
            });
            
            socket.on('endVote', function() {
                $scope.voteStarted = false;
            });
        });
        
        $scope.register = function() {
            console.info('registering', $scope.name);
            socket.emit('newVoter', {name: $scope.voterName});
            $scope.registered = true;
        };
        
        $scope.vote = function (value) {
            $scope.lastVote = value;
            socket.emit('vote', {name: $scope.voterName, vote: value});
        };
    });
