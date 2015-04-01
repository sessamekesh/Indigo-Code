/**
 * Created by kamaron on 3/31/15.
 */

var generic_page_app = angular.module('generic-page-app', []);

generic_page_app.controller('previous-competitions-controller', function ($scope) {
    $scope.competitions = [{
        id: 1,
        name: 'Test Static Previous Competition (1)'
    }, {
        id: 2,
        name: 'Test Static Previous Competition (2)'
    }];
});

generic_page_app.controller('current-competitions-controller', function ($scope) {
   $scope.competitions = [{
       id: 3,
       name: 'Test Current Competition! (3) <b>aww yeah</b>'
   }];
});

generic_page_app.controller('upcoming-competitions-controller', function ($scope) {
   $scope.competitions = [{
       id: 4,
       name: 'Test Upcoming Competition (4)'
   }];
});