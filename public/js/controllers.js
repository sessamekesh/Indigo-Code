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

generic_page_app.controller('registration-section-controller', function ($scope, $http) {
    $scope.type = 'new';
    $scope.on_select_existing = function () {
        $scope.type = 'existing';
    };
    $scope.on_select_new = function () {
        $scope.type = 'new';
    };
    $scope.on_select_blank = function () {
        $scope.type = 'blank';
    };

    $scope.team = {};
});

generic_page_app.controller('users-on-team-controller', function ($scope, $http) {
    "use strict";
    $scope['formfields'] = [
        { type: 'blank', index: 1 },
        { type: 'blank', index: 2 },
        { type: 'blank', index: 3 },
        { type: 'blank', index: 4 }
    ];

    $scope['entry_elements'] = {
        'new': [{
            name: 'name',
            type: 'text',
            value: 'new_test'
        }],
        'existing': [{
            name: 'name',
            type: 'text',
            value: 'existing_test'
        }],
        'blank': [{
            name: 'name',
            type: 'text',
            value: 'blank_test'
        }]
    };
});