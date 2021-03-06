'use strict';

angular.module('clientApp')
  .factory('$uuid', function () {
        return {
            generate: function (){
                var d = new Date().getTime();
                var uuid = 'xxx-xy-xxx'.replace(/[xy]/g, function(c) {
                    var r = (d + Math.random()*16)%16 | 0;
                    d = Math.floor(d/16);
                    return (c=='x' ? r : (r&0x7|0x8)).toString(16);
                });
                return uuid;
            }
        };
  });
