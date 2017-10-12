module.exports = function (EventEmitter, request) {
  var PushClient = function (opts) {
    EventEmitter.call(this)
    this.opts = opts
    this.stopped = true
    if (!opts.ak) {
      throw new Error('access key required')
    }
    if (!opts.name) {
      throw new Error('feed name required')
    }
  }
  PushClient.prototype = Object.create(EventEmitter.prototype)
  PushClient.prototype.constructor = PushClient

  PushClient.prototype.start = function () {
    this.stopped = false
    this.run()
  }
  PushClient.prototype.run = function () {
    if (!this.stopped) {
      this.poll()
    }
  }

  PushClient.prototype.poll = function () {
    request.get({
      url: 'https://app.tt.se/punkt/v1/update',
      qs: { ak: this.opts.ak, name: this.opts.name }
    }, function (err, res, body) {
      if (err) {
        this.emit('error', err)
      } else if (res.statusCode === 504) {
        // noop
      } else if (res.statusCode !== 200) {
        this.emit('error', { statusCode: res.statusCode, message: res.message })
      } else {
        this.emit('update', JSON.parse(body))
      }
      setImmediate(this.run.bind(this))
    }.bind(this))
  }

  return PushClient
}