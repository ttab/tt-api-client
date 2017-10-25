/* global describe,it,beforeEach,expect */

describe('Feed', function () {
  var Feed, feed, request
  beforeEach(function () {
    request = {}
    Feed = require('../lib/feed')(require('events').EventEmitter, request)
  })

  it('requires a feed name', function () {
    expect(function () {
      feed = new Feed()
    }).to.throw('feed name required')
  })
})
