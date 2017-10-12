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
    this.opts.url = this.opts.url || 'https://app.tt.se'
  }
  PushClient.prototype = Object.create(EventEmitter.prototype)
  PushClient.prototype.constructor = PushClient

  PushClient.prototype.start = function () {
    this.stopped = false
    this._run()
  }
  PushClient.prototype.stop = function () {
    this.stopped = true
  }
  PushClient.prototype._run = function () {
    if (!this.stopped) {
      this._poll()
    }
  }

  PushClient.prototype._emit = function (ev, data) {
    this.emit(ev, data)
  }

  PushClient.prototype._poll = function () {
    request.get({
      url: this.opts.url + '/punkt/v1/update',
      qs: { ak: this.opts.ak, name: this.opts.name }
    }, function (err, res, body) {
      if (err) {
        this._emit('error', err)
      } else if (res.statusCode === 504) {
        // noop
      } else if (res.statusCode !== 200) {
        this._emit('error', { statusCode: res.statusCode, message: res.message })
      } else {
        this._emit('update', JSON.parse(body))
      }
      setImmediate(this._run.bind(this))
    }.bind(this))
  }

  return PushClient
}
