module.exports = function(grunt) {

  grunt.initConfig({
  
    connect: {
      server: {
        options: {
          port: 3000,
          hostname: "*",
          base: ['public', 'node_modules/socket.io/node_modules/socket.io-client']
        }
      }
    },
    nodemon: {
      dev: {
        script: 'serverWithPregame.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('server', 'Serving files and starting node.js session', function(target) {
    grunt.task.run([
      'connect', 'nodemon'
    ]);
  });
};
