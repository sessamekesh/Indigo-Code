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
    $scope.on_select_existing = function () {
        $scope.type = 'existing';
    };
    $scope.on_select_new = function () {
        $scope.type = 'new';
    };
    $scope.on_select_blank = function () {
        $scope.type = 'blank';
    };

    $scope.validate_form = function() {
        alert('Validation has begun...');
        console.log($scope.team.name);
        $scope.submit_enabled = false;
        setTimeout(function () { $scope.submit_enabled = true; }, 12345);
    };

    $scope.team = {
        name: '',
        tagline: ''
    };

    $scope['formfields'] = [
        {
            type: 'new',
            data: {}
        },
        {
            type: 'blank',
            data: {}
        },
        {
            type: 'blank',
            data: {}
        },
        {
            type: 'blank',
            data: {}
        }
    ];

    $http.get('/api/user/types').
        success(function (data, status, headers, config) {
            if (data.success == true) {
                $scope.types = data.types;
            } else {
                console.error('Types sent back in invalid format - ' + (data.message || 'reason unknown!'));
                $scope.types = { id: 1, name: 'UNKNOWN_ERR' };
            }
        }).
        error(function (data, status, headers, config) {
            console.error('Could not retrieve types - ' + (data.message || 'reason unknown!'));
            $scope.types = { id: 1, name: 'ERR_TYPE' };
        });

    $scope.submit_enabled = true;
});