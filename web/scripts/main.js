define(['angular','jquery','socketio'], function (angular,$,io) {

  // Define socketio listeners
  var socket = io();
  socket.on('updateUserList', function(data) {
    console.log(data);
    var chatUsers = $("#chatUsers");
    chatUsers.empty();
    for (var user in data.users) {
      if (data.users.hasOwnProperty(user)) {
        chatUsers.append('<div id="' + user + '">' + user + '</div>');
      }
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

	app.controller('chatroomController', function($scope, $location, $rootScope) {
      // check that user doesn't have an empty nickname
      if (!$scope.nickname) {
        $rootScope.nickname = $scope.nickname;
        $location.path("/register");
      }
      // register user once it enters the chatroom
      socket.emit('register', $rootScope.nickname);
  });

  require(['domready'], function (document) {
    angular.bootstrap(document, ['phoneboothApp']);
  });
});