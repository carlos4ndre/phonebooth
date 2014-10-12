define(['angular','jquery','socketio','alertify'], function (angular,$,io,alertify) {

  /******************
  **  Global
  *******************/
  var chatUsers = [];

  /******************
  **  PeerJS
  *******************/
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  var peer = new Peer(generatePeerId(), {host: 'localhost', port: 9000, path: '/', debug: 3 });
  peer.on('call', function(call){
    receiveVideoStream(call);
  });
  peer.on('error', function(err){
      alert(err.message);
  });

  /******************
  **  Socket.io
  *******************/
  var socket = io();

  // Event that updates user list whenever a user enter/leaves the chatroom
  socket.on('updateUserList', function(users) {
    // update user list and reflect this change in the page
    chatUsers = users;
    var chatUsersList = $("#chatUsers ul");
    chatUsersList.empty();
    for (var user in chatUsers) {
      if (chatUsers.hasOwnProperty(user)) {
        chatUsersList.append('<li>'
          + user
          + '<button ng-click="startPrivateChat(&quot;' + user + '&quot;)" class="btn btn-primary btn-xs pushRight" style="display:none">Chat</button>'
          + '</li>'
        );
      }
    }
    // Compile newly created DOM element so that angular can interact with it properly
    chatUsersList.each(function () {
      var content = $(this);
       angular.element(document).injector().invoke(function($compile) {
        var scope = angular.element(content).scope();
        $compile(content)(scope);
      });
    });
  });

  // Event that writes a message to everyone connected to the main chatroom
  socket.on('sendMessage', function(message) {
    var chatMessageBoard = $("#chatMessageBoard");
    chatMessageBoard.append('[' + message.userId + ']: ' + message.text + '<br/>');
  });

  // Event that prompts the user if he/she wishes to accept incoming chat request
  socket.on('chatRequest', function(request) {
    var sender = request.sender;
    var receiver = request.receiver;

    alertify.set({ labels: {
      ok     : "Accept",
      cancel : "Deny"
    }});

    // button labels will be "Accept" and "Deny"
    alertify.confirm('Incoming chat request from ' + sender.userId, function(e) {
      // send answer back to user
      if(e) {
        socket.emit('startChat', request);
        alertify.success("Chat Request Accepted");
        // redirect to private chatroom
        window.location.href = '/#/chatroom/private/' + sender.userId;
      } else {
        socket.emit('cancelChat', request);
        alertify.error("Chat Request Rejected");
      }
    });
  });

  socket.on('startChat', function(chatUser) {
    // redirect to private chatroom
    alertify.success('Chat request accepted by ' + chatUser.userId);
    window.location.href = '/#/chatroom/private/' + chatUser.userId;
  });

  socket.on('cancelChat', function(chatUser) {
    alertify.error('Chat request cancelled by ' + chatUser.userId);
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
          when('/chatroom/private/:userId', {
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
        if ($scope.userId) {
          $rootScope.userId = $scope.userId;
          $location.path("/chatroom/");
        } else {
          console.log('Empty userId!');
        }
      };
	});

  // Controller for main chatroom page
	app.controller('chatRoomController', function($scope, $location, $rootScope) {
      // check that user doesn't have an empty userId
      if (!$scope.userId) {
        $rootScope.userId = $scope.userId;
        $location.path("/register");
      }

      // register user once it enters the chatroom
      var chatUser = {
        userId: $rootScope.userId,
        sessionId: socket.io.engine.id,
        peerId: peer.id
      }
      socket.emit('register', chatUser);

      // create listener to send global message to everyone in the chatroom
      $scope.sendMessageToAll = function() {
        var messageToAll = $("#messageToAll");
        var message = {
          userId: $scope.userId,
          text: messageToAll.val()
        }
        messageToAll.val('');
        socket.emit('sendMessage', message);
      };

      // create listener to start a new private chat
      $scope.startPrivateChat = function(targetUserId) {
        // send chat invite to target user with all sender's information
        var chatRequest = { 
          sender: chatUsers[$rootScope.userId],
          receiver: chatUsers[targetUserId]
        };
        socket.emit('chatRequest', chatRequest);
      }

      // add listener to selected user
      var chatUsersList = $("#chatUsers");
      chatUsersList.on("mouseenter", "li", function (event) {
        $(this).find(':button').show();
      });
      chatUsersList.on("mouseleave", "li", function (event) {
        $(this).find(':button').hide();
      });
  });

  // Controller for private chatroom page
  app.controller('privateChatRoomController', function($scope, $location, $rootScope) {
      // check that user doesn't have an empty userId
      if (!$scope.userId) {
        $rootScope.userId = $scope.userId;
        $location.path("/register");
      }
      // display both local and remote A/V streams
      displayLocalCamera();
      var remoteChatUser = chatUsers[getIdFromURL($location.path())];
      sendVideoStreamTo(remoteChatUser);
  });

  /**********************
  **  Support Functions
  ***********************/
  function displayLocalCamera () {
      // Get audio/video stream
      navigator.getUserMedia({audio: true, video: true}, function(stream){
        // Set your video displays
        $('#chatLocalVideoBox').prop('src', URL.createObjectURL(stream));
        window.localStream = stream;
      }, function() { alert('failed to load local video'); });
  }

  function sendVideoStreamTo(remoteChatUser) {
      // Get audio/video stream
      navigator.getUserMedia({audio: true, video: true}, function(stream){
        // Set your video displays
        window.remoteStream = stream;
        var call = peer.call(remoteChatUser.peerId, window.remoteStream);
        // Wait for stream on the call, then set peer video display
        call.on('stream', function(stream) {
          $('#chatRemoteVideoBox').prop('src', URL.createObjectURL(stream));
        });
      }, function(){ alert('failed to load remote video'); });
  }

  function receiveVideoStream(call) {
    navigator.getUserMedia({video: true, audio: true}, function(stream) {
      // Set your video displays
      window.remoteStream = stream;
      call.answer(stream); // Answer the call with an A/V stream.
      call.on('stream', function(stream) {
        $('#chatRemoteVideoBox').prop('src', URL.createObjectURL(stream));
      });
    }, function(err) {
      console.log('Failed to get local stream' ,err);
    });
  }

  function getIdFromURL(url) {
    return url.substr(url.lastIndexOf('/') + 1);
  }

  function generatePeerId()
  {    
    var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    var peerId = "";

    for( var i=0; i < 14; i++ ) {
        peerId += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return String(peerId);
  }

  require(['domready'], function (document) {
    angular.bootstrap(document, ['phoneboothApp']);
  });
});