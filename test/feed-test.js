/* global describe,it,beforeEach,expect,stub */

describe('Feed', function () {
  var Feed, feed, request
  beforeEach(function () {
    request = {
      get: stub()
    }
    Feed = require('../lib/feed')(require('events').EventEmitter, request)
  })

  it('requires a feed name', function () {
    expect(function () {
      feed = new Feed()
    }).to.throw('feed name required')
  })

  describe('get()', function () {
    beforeEach(function () {
      feed = new Feed({name: 'my-feed'})
    })

    it('is rejected for non-existing feed', function () {
      request.get.callsArgWith(1, undefined, {stausCode: 200}, '{}')
      return feed.get().then(function (res) {

      })
    })

    it('parses json output')

    it('returns an object with an array of hits')

    it('accepts a from argument')
  })
})
