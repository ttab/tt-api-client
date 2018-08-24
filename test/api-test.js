/* global describe,it,beforeEach,stub */

describe('api', function () {
  var Api, request
  beforeEach(function () {
    request = stub()
    Api = require('../api')(require('events').EventEmitter, request)
  })

  describe('search', function () {
    it('calls the search endpoint', function () {
      request.withArgs({
        url: 'https://api.tt.se/content/v1/text/search',
        method: 'get',
        qs: {q: 'panda'},
        headers: {'Authorization': 'Bearer a.itsallgood'}
      }).callsArgWith(1, null, {statusCode: 200}, JSON.stringify({hits: []}))
      var api = Api().token('a.itsallgood')
      return api.content('text').search({q: 'panda'}).should.eventually.eql({hits: []})
    })
  })
})
