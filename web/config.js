// Load modules from the lib directory
requirejs.config({
    baseUrl: 'lib',
    paths: {
        app: '../app',
        angular: 'scripts/libs/angular/angular',
        bootstrap: 'scripts/libs/bootstrap/dist/js/bootstrap',
        'font-awesome': 'scripts/libs/font-awesome/fonts/*',
        requirejs: 'scripts/libs/requirejs/require',
        spin: 'scripts/libs/spin/javascripts/jquery.spin'
    },
    packages: [

    ]
});

// Load app related files
requirejs(['app/main']);