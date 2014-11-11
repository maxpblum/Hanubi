if (process.env.REDISTOGO_URL) {

  console.log('Found redis!')

  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);

  redis.auth(rtg.auth.split(":")[1]);

} else {
  var redis = require("redis").createClient();
}

redis.on("error", function (err) {
  console.log("Error " + err);
});

function ObjSet(singular, groupName) {

  if (!groupName) { groupName = singular + 's'; }

  function objKey(key) {
    return singular + ':' + key;
  }

  this.makeUpdateProp = function(key) {
    console.log('about to write updateProp');
    return function(propKey, value, cb) {
      redis.hset(objKey(key), propKey, value, cb);
    }
  };

  this.add = function(key, obj, cb) {

    var counter = 2;

    function maybeCallback(err, result) {
      counter--;
      if (err) {
        console.log('Error: ' + err);
      }
      else {
        console.log('Result: ' + result);
      }
      if (counter === 0 && cb) {
        cb(err, result);
      }
    }

    redis.sadd(groupName, key, maybeCallback);
    redis.hmset(objKey(key), obj, maybeCallback);
  };

  this.get = function (key, cb) {
    redis.hgetall(objKey(key), cb);
  };

  this.delete = function(key, cb) {
    console.log('Deleting key ' + key + ' from ' + groupName);

    var counter = 2;

    function maybeCallback() {
      counter--;
      if (counter === 0 && cb) {
        cb();
      }
    }

    redis.del(objKey(key), maybeCallback);
    redis.srem(groupName, key, maybeCallback);

  }

  this.getAll = function(cb) {

    console.log('Looking up ' + groupName);

    redis.smembers(groupName, function(err, keys) {

      console.log('in smembers callback, keys: ' + keys);

      var keysLeft = keys.length;
      var reply = {}

      keys.forEach(function(key) {
        console.log('in forEach with key ' + key);
        this.get( key, function(err, obj) {

          if (err) { 
            console.log(err); 
          } else {
            console.log('Found ' + obj + ' at key ' + key);
          }

          reply[key] = obj;
          keysLeft--;
          if (cb && keysLeft === 0) {
            cb(reply);
          }

        } );

      }.bind(this));

    }.bind(this));

  }

}

module.exports = ObjSet;
