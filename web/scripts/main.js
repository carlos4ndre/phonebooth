define(['angular'], function (angular) {
	console.log("Woooohoooooooo!!!");

	//Define an angular module for our app
	var app = angular.module('phoneboothApp', ['ngRoute']);
	app.config(['$routeProvider','$locationProvider', function($routeProvider,$locationProvider) {
		$routeProvider.
      		when('/chatroom', {
        		templateUrl: 'templates/chatroom.html',
        		controller: 'chatroomController'
      		}).
      		when('/register', {
        		templateUrl: 'templates/register.html',
        		controller: 'registerController'
    		}).
      		otherwise({
        		redirectTo: '/register'
      		});
	}]);

	app.controller('registerController', function($scope, $location, $rootScope) {
      $scope.submit = function() {
        if ($scope.nickname) {
          $rootScope.nickname = $scope.nickname;
          $location.path("/chatroom/");
        } else {
          console.log('Empty Nickname!');
        }
      };
	});

	app.controller('chatroomController', function($scope, $rootScope) {
    $scope.message = $rootScope.nickname;
	});

  require(['domready'], function (document) {
    angular.bootstrap(document, ['phoneboothApp']);
  });
});