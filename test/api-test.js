/* global describe,it,beforeEach,afterEach,stub,expect */

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

  it('requires a host name', function () {
    expect(function () { Api({}) }).to.throw('host required')
  })
})
