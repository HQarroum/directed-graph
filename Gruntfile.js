module.exports = function (grunt) {

    // Loading the project package description.
    var pkg = grunt.file.readJSON('package.json');

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Timing the build tasks.
    require('time-grunt')(grunt);

    grunt.initConfig({
	clean: {
	    dist: 'dist/*.js',
	},
	jshint: {
	    options: {
		jshintrc: '.jshintrc'
	    },
	    dist: {
		src: ['Gruntfile.js', 'graph.js']
	    },
	    test: {
		src: ['tests/*.js']
	    }
	},
	uglify: {
	    dist: {
		src: 'graph.js',
		dest: 'dist/graph.min.js'
	    }
	},
	jasmine: {
	    dist: {
		options: {
		    specs: ['tests/*-spec.js'],
		    vendor: ['.grunt/grunt-contrib-jasmine/es5-shim.js'],
		    template: require('grunt-template-jasmine-requirejs'),
		    templateOptions: {
			requireConfig: {
			    buildPath: '../',
			    paths: {
				'lodash': 'libs/lodash/dist/lodash.min',
				'event-emitter': 'libs/eventemitter2/lib/eventemitter2'
			    }
			}
		    },
		    junit: {
			path: 'reports/junit/jasmine'
		    }
		}
	    }
	},
	copy: {
	    dist: {
		files: [
		    { expand: true, src: ['./*.json'], dest: 'dist/' }
		]
	    }
	}
    });

    // Registering the tasks.
    grunt.registerTask('test', ['jasmine']);
    grunt.registerTask('default', ['clean', 'jshint', 'uglify', 'test']);
};
