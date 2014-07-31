'use strict';

angular.module('clientApp')
    .controller('MonitorCtrl', function ($scope, $http, $route, $location, $socket, $sce, $bbpJiraRest) {
        
        var voteCounter = 0;
        $scope.voteId = $route.current.params.id;
        $scope.voterUrl = window.location.origin + '/#/voter/' + $scope.voteId;
        $scope.voting = false;
        $scope.voteOver = false;
        $scope.voters = [];
        $scope.jiraTicket = "LBK-1489";

        $socket.on('connect', function() {

            $socket.emit('room', $scope.voteId);

            // $socket.on('newVoter', function(voter){
            //     $scope.voters.push(voter);
            // });
            
            $socket.on('vote', function (vote) {
                if(!_.find($scope.votes[vote.vote], { 'id': vote.voter.id })) {
                    console.log(vote);
                    $scope.votes[vote.vote].push(vote.voter);
                    if($scope.votesCount() === $scope.voters.length) {
                        $socket.emit('endVote');
                        $scope.voteOver = true;
                        $scope.voting = false;
                    }
                }
            });

            $socket.on('currentVote', function(vote) {
                console.log('currentVote', vote);
                $scope.voters = vote.voters;
            });
        });
        
        $scope.startVote = function () {
            $socket.emit('startVote', voteCounter++);
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

        $scope.votesCount = function() {
            return $scope.votes.S.length + $scope.votes.M.length + $scope.votes.L.length +$scope.votes.XL.length + $scope.votes.XXL.length;
        }

        $scope.endVote = function () {
            $socket.emit('endVote');
            $scope.voting = false;
            $scope.voteOver = true;
        };

        $scope.kickOff = function(voter) {
            console.log('kickOff', voter);
            $socket.emit('leaveVoter', voter);

            var index = $scope.voters.indexOf(voter);
            $scope.voters.splice(index, 1);
        }

        $scope.clear = function() {
            $scope.voting = false;
            $scope.voteOver = false;
        };

        $scope.loadJiraTicket = function() {
            console.log($scope.jiraTicket);
            $bbpJiraRest.getIssue($scope.jiraTicket).then(function(response) {
                console.log(response);
                $scope.jiraIssue = response.data;
            });
        };

        $scope.loadJiraTicket();
        
    })
    .controller('VoterCtrl', function ($scope, $http, $route, $socket, $uuid) {
        $scope.voteId = $route.current.params.id;
        $scope.registered = false;
        $scope.voteStarted = false;
        $scope.voter = {};
        $scope.voted = false;

        $socket.on('connect', function() {
            $socket.emit('room', $scope.voteId);

            var voter = localStorage.getItem('bbpScrumVoter');
            console.log(voter)
            voter = JSON.parse(voter);
            
            if(voter) {
                $socket.emit('newVoter', voter);
                $scope.registered = true;
                $scope.voter = voter;
            }

            $socket.on('startVote', function() {
                $scope.voteStarted = true;
                $scope.lastVote = undefined;
            });
            
            $socket.on('endVote', function() {
                $scope.voteStarted = false;
                $scope.lastVote = undefined;
            });

            $socket.on('leaveVoter', function(voter) {
                if($scope.voter &&
                    $scope.voter.id &&
                    $scope.voter.id === voter.id) {

                    // I've been kicked out :(
                    localStorage.removeItem('bbpScrumVoter');
                    $scope.registered = false;
                    $scope.voter = {};
                }
            });

            $socket.on('currentVote', function(vote) {
                console.log('currentVote', vote);
                $scope.currentVote = vote;
            });
        });
        
        $scope.register = function() {
            var voter = { name: $scope.voter.name, 
                            id: $uuid.generate()
                        };
            console.info('registering', voter);

            $socket.emit('newVoter', voter);
            $scope.registered = true;
            $scope.voter = voter;

            localStorage.setItem('bbpScrumVoter', JSON.stringify(voter));
        };
        
        $scope.vote = function (value) {
            $scope.lastVote = value;
            $socket.emit('vote', {voter: $scope.voter, vote: value});
        };

        $scope.deregister = function() {
            $socket.emit('leaveVoter', $scope.voter);
            localStorage.removeItem('bbpScrumVoter');
            $scope.registered = false;
            $scope.voter = {};
        };

    });
