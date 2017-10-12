module.exports = function (EventEmitter, request) {
  var Client = require('./lib/push-client')(EventEmitter, request)
  return {
    pushClient: function (opts) {
      return new Client(opts)
    }
  }
}
