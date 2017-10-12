/* global describe,it,beforeEach,afterEach,expect,stub */

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

  describe('poll()', function () {
    it('calls the longpoll update endpoint', function () {
      request.get.callsArgWith(1, undefined, { statusCode: 200 }, '{}')
      client = new PushClient({ak: '111-222', name: 'panda'})
      client.poll()
      request.get.should.have.been.calledWith({
        url: 'https://app.tt.se/punkt/v1/update',
        qs: { ak: '111-222', name: 'panda' }
      })
    })

    it('emits events on updates', function (done) {
      request.get.callsArgWith(1, undefined, { statusCode: 200 }, JSON.stringify({uri: 'http://tt.se/panda'}))
      client = new PushClient({ak: '111-222', name: 'panda'})
      client.on('update', function (data) {
        expect(data).to.eql({uri: 'http://tt.se/panda'})
        done()
      })
      client.poll()
    })

    it('respects 504 errors', function (done) {
      request.get.callsArgWith(1, undefined, { statusCode: 504 }, undefined)
      client = new PushClient({ak: '111-222', name: 'panda'})
      client.on('error', function (data) {
        throw new Error('should not report 504 as error')
      })
      setTimeout(done, 100)
      client.poll()
    })

    it('emits other server errors', function (done) {
      request.get.callsArgWith(1, undefined, { statusCode: 500 }, undefined)
      client = new PushClient({ak: '111-222', name: 'panda'})
      client.on('error', function (err) {
        expect(err.statusCode).to.equal(500)
        done()
      })
      client.poll()
    })

    it('emits application errors', function (done) {
      request.get.callsArgWith(1, new Error('panda attack'))
      client = new PushClient({ak: '111-222', name: 'panda'})
      client.on('error', function (err) {
        expect(err.message).to.equal('panda attack')
        done()
      })
      client.poll()
    })
  })
})
