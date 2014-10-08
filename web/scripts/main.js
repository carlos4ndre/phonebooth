define(['angular','jquery','socketio'], function (angular,$,io) {

  /******************
  **  Global
  *******************/
  var chatUsers = [];

  /******************
  **  PeerJS
  *******************/
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  var peer = new Peer(generatePeerId());


  /******************
  **  Socket.io
  *******************/
  var socket = io();

  // Event that updated users list whenever a user enter/leaves chat
  socket.on('updateUserList', function(users) {
    // update users list and also display them on page
    chatUsers = users;
    var userList = $("#chatUsers ul");
    userList.empty();
    for (var user in chatUsers) {
      if (chatUsers.hasOwnProperty(user)) {
        userList.append('<li>'
          + user
          + '<button ng-click="startPrivateChat(&quot;' + user + '&quot;)" class="btn btn-primary btn-xs pushRight" style="display:none">Chat</button>'
          + '</li>'
        );
      }
    }
    // Compile newly created DOM element so that angular can interact with it properly
    userList.each(function () {
      var content = $(this);
       angular.element(document).injector().invoke(function($compile) {
        var scope = angular.element(content).scope();
        $compile(content)(scope);
      });
    });
  });

  // Event that writes a message to everyone connected to the chat
  socket.on('sendMessage', function(message) {
    var chatMessageBoard = $("#chatMessageBoard");
    chatMessageBoard.append('[' + message.nickname + ']: ' + message.text + '<br/>');
  });

  // Event that prompts the user if he/she wishes to accept incoming chat request
  socket.on('chatRequest', function(sender) {
      alert('Incoming chat request from ' + sender.nickname);
  });

  /******************
  **  AngularJS
  *******************/

  // Define angular routing
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

  // Controller for register page
	app.controller('registerController', function($scope, $location, $rootScope) {
      $scope.registerUser = function() {
        if ($scope.nickname) {
          $rootScope.nickname = $scope.nickname;
          $location.path("/chatroom/");
        } else {
          console.log('Empty Nickname!');
        }
      };
	});

  // Controller for main chatroom page
	app.controller('chatRoomController', function($scope, $location, $rootScope) {
      // check that user doesn't have an empty nickname
      if (!$scope.nickname) {
        $rootScope.nickname = $scope.nickname;
        $location.path("/register");
      }
      // register user once it enters the chatroom
      var chatUser = {
        nickname: $rootScope.nickname,
        sessionId: socket.io.engine.id,
        peerId: peer.id
      }
      socket.emit('register', chatUser);

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

  // Controller for private chatroom page
  app.controller('privateChatRoomController', function($scope, $location, $rootScope) {
      // check that user doesn't have an empty nickname
      if (!$scope.nickname) {
        $rootScope.nickname = $scope.nickname;
        $location.path("/register");
      }

      // send chat invite to target user with all sender's information
      var chatRequest = { 
        sender: chatUsers[$scope.nickname],
        receiver: chatUsers[getIdFromURL($location.path())]
      };
      socket.emit('chatRequest', chatRequest);
  });

  /**********************
  **  Support Functions
  ***********************/
  function startLocalVideo () {
      // Get audio/video stream
      navigator.getUserMedia({audio: true, video: true}, function(stream){
        // Set your video displays
        $('#chatLocalVideoBox').prop('src', URL.createObjectURL(stream));
        window.localStream = stream;
      }, function() { alert('failed to load video'); });
  }

  function getIdFromURL(url) {
    return url.substr(url.lastIndexOf('/') + 1);
  }

  function generatePeerId()
  {    
    var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    var peerId = "";

    for( var i=0; i < 20; i++ ) {
        peerId += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return peerId;
  }

  require(['domready'], function (document) {
    angular.bootstrap(document, ['phoneboothApp']);
  });
});