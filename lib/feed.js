'use strict'

module.exports = function (EventEmitter, request) {
  var Updates = require('./updates')(EventEmitter, request)

  var Feed = function (opts) {
    this.opts = opts || {}
    if (!this.opts.name) {
      throw new Error('feed name required')
    }
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
          try {
            return resolve(JSON.parse(body))
          } catch (err) {
            return reject(err)
          }
        }
      })
    }.bind(this))
  }

  return Feed
}
