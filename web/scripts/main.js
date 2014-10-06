define(['angular','jquery','socketio'], function (angular,$,io) {

  // Define socketio listeners
  var socket = io();
  socket.on('updateUserList', function(userList) {
    var chatUsers = $("#chatUsers ul");
    chatUsers.empty();
    for (var user in userList.users) {
      if (userList.users.hasOwnProperty(user)) {
        chatUsers.append('<li>'
          + user
          + '<button ng-click="startPrivateChat(&quot;' + user + '&quot;)" class="btn btn-primary btn-xs pushRight" style="display:none">Chat</button>'
          + '</li>'
        );
      }
    }
    // Compile new DOM element so that angular can use it properly
    chatUsers.each(function () {
      var content = $(this);
       angular.element(document).injector().invoke(function($compile) {
        var scope = angular.element(content).scope();
        $compile(content)(scope);
      });
    });
  });
  socket.on('sendMessage', function(message) {
    var chatMessageBoard = $("#chatMessageBoard");
    chatMessageBoard.append('[' + message.nickname + ']: ' + message.text + '<br/>');
  });

  // Define an angular module for our app
  var app = angular.module('phoneboothApp', ['ngRoute']);
  app.config(['$routeProvider','$locationProvider', function($routeProvider,$locationProvider) {
    $routeProvider.
          when('/chatroom', {
        		templateUrl: 'templates/chatroom.html',
        		controller: 'chatRoomController'
      		}).
      		when('/register', {
        		templateUrl: 'templates/register.html',
        		controller: 'registerController'
    		  }).
          when('/chatroom/private/:nickname', {
            templateUrl: 'templates/privatechatroom.html',
            controller: 'privateChatRoomController'
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

	app.controller('chatRoomController', function($scope, $location, $rootScope) {
      // check that user doesn't have an empty nickname
      if (!$scope.nickname) {
        $rootScope.nickname = $scope.nickname;
        $location.path("/register");
      }
      // register user once it enters the chatroom
      socket.emit('register', $rootScope.nickname);

      // create listener to send global message to everyone in the chatroom
      $scope.sendMessageToAll = function() {
        var messageToAll = $("#messageToAll");
        var message = {
          nickname: $scope.nickname,
          text: messageToAll.val()
        }
        messageToAll.val('');
        socket.emit('sendMessage', message);
      };

      // create listener to start a new private chat
      $scope.startPrivateChat = function(nickname) {
        $location.path("/chatroom/private/" + nickname);
      }

      // add listener to selected user
      var chatUsers = $("#chatUsers");
      chatUsers.on("mouseenter", "li", function (event) {
        $(this).find(':button').show();
      });
      chatUsers.on("mouseleave", "li", function (event) {
        $(this).find(':button').hide();
      });
  });

  app.controller('privateChatRoomController', function($scope, $location, $rootScope) {
      // check that user doesn't have an empty nickname
      if (!$scope.nickname) {
        $rootScope.nickname = $scope.nickname;
        $location.path("/register");
      }
  });

  require(['domready'], function (document) {
    angular.bootstrap(document, ['phoneboothApp']);
  });
});