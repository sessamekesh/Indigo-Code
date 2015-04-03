/**
 * Created by kamaron on 3/31/15.
 */

var generic_page_app = angular.module('generic-page-app', []);

generic_page_app.controller('previous-competitions-controller', function ($scope, $http) {
    $http.get('/api/competition/past').
        success(function (data, status, headers, config) {
            $scope.competitions = data.result;
        }).
        error(function (data, status, headers, config) {
            console.log('Error - ' + data);
        });
});

generic_page_app.controller('current-competitions-controller', function ($scope, $http) {
    $http.get('/api/competition/present').
        success(function (data, status, headers, config) {
            $scope.competitions = data.result;
        }).
        error(function (data, status, headers, config) {
            console.log('Error - ' + data);
        });
});

generic_page_app.controller('upcoming-competitions-controller', function ($scope, $http) {
    $http.get('/api/competition/future').
        success(function (data, status, headers, config) {
            $scope.competitions = data.result;
        }).
        error(function (data, status, headers, config) {
            console.log('Error - ' + data);
        });
});