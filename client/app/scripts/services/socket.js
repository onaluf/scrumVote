'use strict';

angular.module('clientApp')
  .factory('socket', function ($rootScope) {
        var socket = io.connect('http://bluebrain87.epfl.ch:3000');
        return {
            on: function (eventName, callback) {
                debugger;
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        };
  });
