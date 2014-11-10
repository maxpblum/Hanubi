if (process.env.REDISTOGO_URL) {

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

  this.add = function(key, obj) {
    redis.sadd(groupName, key);
    writeObj(objKey(key), obj);
  };

  this.get = function (userKey, cb) {

    redis.hgetall(objKey(userKey), function(err, obj) {

      obj.updateProp = function(propKey, value) {
        redis.hset(userKey, propKey, value);
      };

      cb(obj);

    });

  };

  this.delete = function(key) {
    redis.del(objKey(key));
    redis.srem(groupName, key);
  }

  this.getAll = function(cb) {

    redis.smembers(groupName, function(err, keys) {

      keys.forEach(function(key) {

        this.get( objKey(key), function(obj) {

          reply[key] = obj;

        } );

      reply.finished = true;

      }.bind(this));

      cb(reply);

    }.bind(this));

  }

}

function writeObj(key, obj) {

  var args = [key]

  for (var propKey in obj) {
    if (obj.hasOwnProperty(propKey) && obj[propKey]) {
      args.push(propKey);
      args.push(obj[propKey]);
    }
  }

  redis.hmset.apply(redis, args);

}

module.exports.ObjSet = ObjSet;
