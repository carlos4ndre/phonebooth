    // Configure paths
requirejs.config({
    baseUrl: '',
    paths: {
        app: '../scripts',
        angular: 'scripts/libs/angular/angular',
        bootstrap: 'scripts/libs/bootstrap/dist/js/bootstrap',
        requirejs: 'scripts/libs/requirejs/require',
        spin: 'scripts/libs/spin/javascripts/jquery.spin',
        peerjs: 'scripts/libs/peerjs/peer',
        jquery: 'scripts/libs/jquery/dist/jquery.min',
        'angular-route': 'scripts/libs/angular-route/angular-route',
        'angular-resource': 'scripts/libs/angular-resource/angular-resource',
        domready: 'scripts/libs/domready/ready',
        socketio: '../socket.io/socket.io',
        alertify: 'scripts/libs/alertify/alertify.min'
    },
    shim: {
        socketio: {
            exports: 'io'
        },
        bootstrap: [
            'jquery'
        ],
        angular: {
            exports: 'angular'
        },
        'angular-route': {
            exports: 'ngRoute',
            deps: [
                'angular'
            ]
        },
        'angular-resource': {
            exports: 'ngResource',
            deps: [
                'angular'
            ]
        }
    },
    waitSeconds: 30,
    packages: [

    ]
});

// Load modules
requirejs(['peerjs','socketio','jquery','domready','bootstrap','alertify','angular','angular-route','angular-resource'],function() {
    requirejs(['app/main']);
});