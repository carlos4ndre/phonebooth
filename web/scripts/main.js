define(['angular','jquery','socketio'], function (angular,$,io) {

  // Define socketio listeners
  var socket = io();
  socket.on('register', function(registrationStatus){
    if(registrationStatus.status) {
      console.log('Registration OK.');
      console.log('Nickname: ' + registrationStatus.nickname);
      // Update users list
      var chatUsers = $("#chatUsers");
      chatUsers.append('<b>' + registrationStatus.nickname + '</b>');
    } else {
      console.log('Registration NOK.');
    }
  });

	// Define an angular module for our app
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
    // register user once it enters the chatroom
    socket.emit('register', $rootScope.nickname);
  });

  require(['domready'], function (document) {
    angular.bootstrap(document, ['phoneboothApp']);
  });
});