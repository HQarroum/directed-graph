module.exports = function (grunt) {

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
  mochaTest: {
    test: {
      src: ['tests/**/*.js']
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
    grunt.registerTask('test', ['mochaTest']);
    grunt.registerTask('default', ['clean', 'jshint', 'uglify', 'test']);
};
