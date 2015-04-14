/**
 * Created by kamaron on 3/31/15.
 */

var generic_page_app = angular.module('generic-page-app', []);

// http://stackoverflow.com/questions/4255472/javascript-object-access-variable-property-by-name-as-string
//  Answer #2, post from Prusprus (http://stackoverflow.com/users/751564/prusprus)
// Modified to fit my needs.
function setFromObject(obj, prop, val) {

    if(typeof obj === 'undefined') return false;

    var _arrindex = prop.indexOf('[');
    var _index = prop.indexOf('.');

    if (_arrindex > -1 && _index > -1) {
        if (_index < _arrindex) {
            _arrindex = -1;
        } else {
            _index = -1;
        }
    }

    if(_index > -1 && _arrindex == -1)
    {
        return setFromObject(obj[prop.substr(0, _index)], prop.substr(_index+1), val);
    }
    else if (_index == -1 && _arrindex > -1)
    {
        return setFromObject(obj[prop.substr(0, _arrindex)][prop.substr(_arrindex + 1, (prop.indexOf(']') - _arrindex - 1))], prop.substr(prop.indexOf(']') + 2), val);
    }

    obj[prop] = val;
}

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

    var to_clear = [];

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
        $scope.submit_enabled = false;
        setTimeout(function () { $scope.submit_enabled = true; }, 12345);

        var send = {
            team_name: $scope.team_name,
            comp_id: $scope.comp_id,
            team_tagline: $scope.team_tagline,
            user_data: $scope['user_data']
        };
        console.log(send);

        for (var i = 0; i < to_clear.length; i++) {
            setFromObject($scope, to_clear[i] + '_err', '');
        }

        $http.post('/api/team/register', send).
            success(function (data/*, status, headers, config*/) {
                "use strict";
                console.log('SUCCESS');
                console.log(data);
            }).
            error(function (data/*, status, headers, config*/) {
                "use strict";
                console.log('FAIL');
                console.log(data);

                for (var i = 0; i < (data.error_list || []).length; i++) {
                    // I know this is hacky, but frontend... I can fix this in 1.0.
                    //  I just need it to work...
                    to_clear.push(data.error_list[i].param);
                    setFromObject($scope, data.error_list[i].param + '_err', data.error_list[i].error);
                }
            }
        );
    };

    $scope.comp_id = document.getElementById('comp_data_id').value;
    $scope.num_users = document.getElementById('comp_data_max_team_size').value;

    $scope.team_name = 'Team Awesome';
    $scope.team_tagline = 'Test Tagline';

    $scope['user_data'] = [
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
        $scope['user_data'].push({ type: 'blank', data: {} });
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