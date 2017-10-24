module.exports = function (EventEmitter, request) {
  const Updates = require('./updates')(EventEmitter, request)

  const Feed = function (opts) {
    this.opts = opts
  }

  Feed.prototype.updates = function () {
    return new Updates(this.opts)
  }

  Feed.prototype.get = function (args) {
    return new Promise(function (resolve, reject) {
      request.get({
        url: this.opts.url + '/punkt/v1/getfeed',
        qs: {
          ak: this.opts.ak,
          name: this.opts.name,
          from: args.from
        }
      }, function (err, res, body) {
        if (err) {
          return reject(err)
        } else {
          return resolve(body)
        }
      })
    }.bind(this))
  }

  return Feed
}
