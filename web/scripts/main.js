define(['angular'], function (angular) {
	console.log("Woooohoooooooo!!!");

	//Define an angular module for our app
	var app = angular.module('phoneboothApp', ['ngRoute']);
	app.config(['$routeProvider','$locationProvider', function($routeProvider,$locationProvider) {
		$routeProvider.
      		when('/', {
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

	app.controller('registerController', function($scope) {
    	$scope.message = 'This is registerController';
	});

	app.controller('chatroomController', function($scope) {
    	$scope.message = 'This is chatroomController';
	});

    require(['domready'], function (document) {
        angular.bootstrap(document, ['phoneboothApp']);
    });
});