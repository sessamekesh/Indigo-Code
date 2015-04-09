/**
 * Created by kamaron on 3/31/15.
 */

var generic_page_app = angular.module('generic-page-app', []);

generic_page_app.controller('previous-competitions-controller', function ($scope, $http) {
    $http.get('/api/competition/past').
        success(function (data/*, status, headers, config*/) {
            $scope.competitions = data.result;
        }).
        error(function (data/*, status, headers, config*/) {
            console.log('Error - ' + data);
        });
});

generic_page_app.controller('current-competitions-controller', function ($scope, $http) {
    $http.get('/api/competition/present').
        success(function (data/*, status, headers, config*/) {
            $scope.competitions = data.result;
        }).
        error(function (data/*, status, headers, config*/) {
            console.log('Error - ' + data);
        });
});

generic_page_app.controller('upcoming-competitions-controller', function ($scope, $http) {
    $http.get('/api/competition/future').
        success(function (data/*, status, headers, config*/) {
            $scope.competitions = data.result;
        }).
        error(function (data/*, status, headers, config*/) {
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
        console.log($scope.team.name);
        $scope.submit_enabled = false;
        setTimeout(function () { $scope.submit_enabled = true; }, 12345);

        $http.post('/api/team/register', {
            team_name: $scope.team.name,
            comp_id: $scope.comp_id,
            team_tagline: $scope.team.tagline,
            user_data: $scope['formfields']
        }).
            success(function (data/*, status, headers, config*/) {
                "use strict";
                console.log('SUCCESS');
                console.log(data);
            }).
            error(function (data/*, status, headers, config*/) {
                "use strict";
                console.log('FAIL');
                console.log(data);
            }
        );
    };

    $scope.comp_id = document.getElementById('comp_data_id').value;
    $scope.num_users = document.getElementById('comp_data_max_team_size').value;

    $scope.team = {
        name: 'Team Awesome',
        tagline: 'Test Tagline'
    };

    $scope['formfields'] = [
        {
            type: 'existing',
            data: {
                username: 'sessamekesh',
                pass: 'sess'
            }
        }
    ];

    console.log($scope.num_users);

    for (var i = 1; i < $scope.num_users; i++) {
        $scope['formfields'].push({ type: 'blank', data: {} });
    }

    $http.get('/api/user/types').
        success(function (data/*, status, headers, config*/) {
            if (data.success == true) {
                $scope.types = data.types;
            } else {
                console.error('Types sent back in invalid format - ' + (data.message || 'reason unknown!'));
                $scope.types = { id: 1, name: 'UNKNOWN_ERR' };
            }
        }).
        error(function (/*data, status, headers, config*/) {
            console.error('Could not retrieve types - ' + (data.message || 'reason unknown!'));
            $scope.types = { id: 1, name: 'ERR_TYPE' };
        });

    $scope.submit_enabled = true;
});