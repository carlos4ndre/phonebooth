module.exports = function(grunt) {

	//--------------------------==
	// Configure grunt plugins
	//--------------------------==
	grunt.initConfig({
    	pkg: grunt.file.readJSON('package.json'),
    	clean: ["node_modules", "web/scripts/libs"],
    	bower: {
    		target: {
      			rjsConfig: 'web/config.js',
                options: {
                    exclude: ['fontawesome']
                }
    		}
        }
  	});

	//-----------------------==
	// Load grunt plugins
	//-----------------------==
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-bower-requirejs');

	//-----------------------==
	// Register tasks
	//-----------------------==
	grunt.registerTask('default', ['bower']);

    grunt.registerTask('install', 'install the backend and frontend dependencies', function() {
        var exec = require('child_process').exec;
        var cb = this.async();
        exec('bower install', function(err, stdout, stderr) {
            console.log(stdout);
            cb();
        });
    });
};
