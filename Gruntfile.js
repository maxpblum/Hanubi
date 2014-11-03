module.exports = function(grunt) {

  grunt.initConfig({
  
    connect: {
      server: {
        options: {
          port: 3000,
          hostname: "*",
          keepalive: true,
          base: ['public', 'node_modules/socket.io/node_modules/socket.io-client']
        }
      }
    },
    concurrent: {
      server: {
        tasks: ['connect', 'nodemon'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    nodemon: {
      dev: {
        script: 'hserver.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('server', 'Serving files and starting node.js session', function(target) {
    grunt.task.run([
      'concurrent'
    ]);
  });
};
