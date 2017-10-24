module.exports = function (EventEmitter, request) {
  const Feed = require('./feed')(EventEmitter, request)

  var PushClient = function (opts) {
    this.opts = opts
    if (!opts.ak) {
      throw new Error('access key required')
    }
    this.opts.url = this.opts.url || 'https://app.tt.se'
  }

  PushClient.prototype.feed = function (opts) {
    if (!opts.name) {
      throw new Error('feed name required')
    }
    return new Feed({
      ak: this.opts.ak,
      url: this.opts.url,
      name: opts.name
    })
  }

  return PushClient
}
