/* global describe,it,beforeEach,afterEach,stub */

describe('api', function () {
  var Api, request
  beforeEach(function () {
    request = require('request')
    stub(request, 'get')
    Api = require('../api')(require('events').EventEmitter, request)
  })
  afterEach(function () {
    request.get.restore()
  })

  describe('search', function () {
    it('calls the search endpoint', function () {
      request.get.withArgs({
        url: 'https://api.tt.se/content/v1/text/search',
        qs: {q: 'panda'},
        headers: {'Authorization': 'Bearer a.itsallgood'}
      }).callsArgWith(1, null, {statusCode: 200}, JSON.stringify({hits: []}))
      var api = Api().token('a.itsallgood')
      return api.content('text').search({q: 'panda'}).should.eventually.eql({hits: []})
    })
  })
})
