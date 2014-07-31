'use strict';

angular.module('clientApp')
  .factory('$bbpJiraRest', function ($http, $sce) {

        var jiraUrl = "https://bbpteam.epfl.ch/project/issues/browse/";
        $sce.trustAsResourceUrl(jiraUrl);

        return {
            getIssue: function(id) {
                return $http.get('/' + id + '.json');
            }
        };
  });