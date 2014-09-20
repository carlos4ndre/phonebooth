// Configure paths
requirejs.config({
    baseUrl: '',
    paths: {
        app: '../scripts',
        angular: 'scripts/libs/angular/angular',
        bootstrap: 'scripts/libs/bootstrap/dist/js/bootstrap',
        'font-awesome': 'scripts/libs/font-awesome/fonts/*',
        requirejs: 'scripts/libs/requirejs/require',
        spin: 'scripts/libs/spin/javascripts/jquery.spin',
        fontawesome: 'scripts/libs/fontawesome/fonts/*',
        peerjs: 'scripts/libs/peerjs/peer.min'
    },
    packages: [

    ],
    waitSeconds: 30
});

// Load modules
requirejs(['peerjs','app/main']);