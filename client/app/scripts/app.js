'use strict';

angular.module('clientApp', ['ngRoute','monospaced.qrcode'])
.config(function ($routeProvider) {
    function generateUUID(){
        var d = new Date().getTime();
        var uuid = 'xxxxyxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x7|0x8)).toString(16);
        });
        return uuid;
    };

    $routeProvider
        .when('/monitor/:id', {
            templateUrl: 'views/monitor.html',
            controller: 'MonitorCtrl'
        })
        .when('/voter/:id', {
            templateUrl: 'views/voter.html',
            controller: 'VoterCtrl'
        })
        .otherwise({
            redirectTo: '/monitor/' + generateUUID()
        });
});

  
