/* global describe,it,beforeEach,afterEach,expect,stub */
/* eslint-disable no-unused-expressions */

describe('PushClient', function () {
  var PushClient, request, client
  beforeEach(function () {
    request = require('request')
    stub(request, 'get')
    PushClient = require('../lib/push-client')(require('events').EventEmitter, request)
  })
  afterEach(function () {
    request.get.restore()
  })

  it('requires an access key', function () {
    expect(function () {
      client = new PushClient({})
    }).to.throw('access key required')
  })

  it('requires a feed name', function () {
    expect(function () {
      client = new PushClient({ak: '111-222'})
    }).to.throw('feed name required')
  })

  it('assumes a default url if not specified', function () {
    client = new PushClient({ak: '111-222', name: 'panda'})
    expect(client.opts).to.have.property('url', 'https://app.tt.se')
  })

  it('allows custom urls', function () {
    client = new PushClient({ak: '111-222', name: 'panda', url: 'http://localhost:8080'})
    expect(client.opts).to.have.property('url', 'http://localhost:8080')
  })

  describe('start()', function () {
    it('starts the loop', function () {
      client = new PushClient({ak: '111-222', name: 'panda', url: 'http://localhost:8080'})
      client._run = stub()
      expect(client.stopped).to.equal(true)
      client.start()
      expect(client.stopped).to.equal(false)
      client._run.should.have.been.calledWith()
    })
  })

  describe('stop()', function () {
    it('stops the loop', function () {
      client = new PushClient({ak: '111-222', name: 'panda', url: 'http://localhost:8080'})
      client._run = stub()
      client.start()
      expect(client.stopped).to.equal(false)
      client._run.should.have.been.calledWith()
      client.stop()
      expect(client.stopped).to.equal(true)
    })
  })

  describe('_run()', function () {
    it('does not call _poll if stopped', function () {
      client = new PushClient({ak: '111-222', name: 'panda'})
      stub(client, '_poll')
      client._run()
      client._poll.should.not.have.been.called
    })
  })

  describe('_emit()', function () {
    it('does not emit while stopped', function (done) {
      client = new PushClient({ak: '111-222', name: 'panda'})
      client.on('update', function () {
        throw new Error('should not emit while stopped')
      })
      setTimeout(done, 50)
      client._emit('update', {})
    })
  })

  describe('_poll()', function () {
    beforeEach(function () {
      client = new PushClient({ak: '111-222', name: 'panda'})
      client.stopped = false
      stub(client, '_run')
    })

    it('calls the longpoll update endpoint', function () {
      request.get.callsArgWith(1, undefined, { statusCode: 200 }, '{}')
      client._poll()
      request.get.should.have.been.calledWith({
        url: 'https://app.tt.se/punkt/v1/update',
        qs: { ak: '111-222', name: 'panda' }
      })
    })

    it('emits events on updates', function (done) {
      request.get.callsArgWith(1, undefined, { statusCode: 200 }, JSON.stringify({uri: 'http://tt.se/panda'}))
      client.on('update', function (data) {
        expect(data).to.eql({uri: 'http://tt.se/panda'})
        done()
      })
      client._poll()
    })

    it('respects 408 errors', function (done) {
      request.get.callsArgWith(1, undefined, { statusCode: 408 }, undefined)
      client.on('error', function (data) {
        throw new Error('should not report 408 as error')
      })
      setTimeout(done, 50)
      client._poll()
    })

    it('respects 504 errors', function (done) {
      request.get.callsArgWith(1, undefined, { statusCode: 504 }, undefined)
      client.on('error', function (data) {
        throw new Error('should not report 504 as error')
      })
      setTimeout(done, 50)
      client._poll()
    })

    it('respects ETIMEDOUT errors', function (done) {
      var err = new Error()
      err.code = 'ETIMEDOUT'
      request.get.callsArgWith(1, err, undefined, undefined)
      client.on('error', function (data) {
        throw new Error('should not report ETIMEDOUT as error')
      })
      setTimeout(done, 50)
      client._poll()
    })

    it('respects ESOCKETTIMEDOUT errors', function (done) {
      var err = new Error()
      err.code = 'ESOCKETTIMEDOUT'
      request.get.callsArgWith(1, err, undefined, undefined)
      client.on('error', function (data) {
        throw new Error('should not report ESOCKETTIMEDOUT as error')
      })
      setTimeout(done, 50)
      client._poll()
    })

    it('emits other server errors', function (done) {
      request.get.callsArgWith(1, undefined, { statusCode: 500 }, undefined)
      client.on('error', function (err) {
        expect(err.statusCode).to.equal(500)
        done()
      })
      client._poll()
    })

    it('emits application errors', function (done) {
      request.get.callsArgWith(1, new Error('panda attack'))
      client.on('error', function (err) {
        expect(err.message).to.equal('panda attack')
        done()
      })
      client._poll()
    })

    it('handles JSON parse errors', function (done) {
      request.get.callsArgWith(1, undefined, { statusCode: 200 }, '<html><title>hello world</title></html>')
      client.on('error', function (err) {
        expect(err).to.be.an.instanceof(SyntaxError)
        done()
      })
      client._poll()
    })
  })
})
