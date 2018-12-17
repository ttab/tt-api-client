const debug = require('debug')('tt:api')
const axios = require('axios')

module.exports = function (EventEmitter, request) {
  return function (opts) {
    opts = Object.assign({ host: 'https://api.tt.se' }, opts)
    var token
    var rest = function (ap, v) {
      if (!v) v = 'v1'
      return function (mt, op, q, method, body) {
        if (!method) method = 'get'
        var url = [ opts.host, ap, v, mt, op ].filter(function (i) {
          return i
        }).join('/')
        debug(method, url, q)
        return axios({
          method: method,
          url: url,
          params: q,
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          data: body
        }).then(function (res) {
          return res.data
        }).catch(function (err) {
          if (err.response) {
            var e
            if (typeof err.response.data === 'object') {
              e = new Error(err.response.data.message)
              for (var prop of Object.entries(err.response.data)) {
                if (prop[0] !== 'message') {
                  e[prop[0]] = prop[1]
                }
              }
            } else {
              e = new Error(err.response.data)
            }
            e.statusCode = err.response.status
            throw e
          }
          throw err
        })
      }
    }

    var api = {
      token: function (_token) {
        token = _token
        return api
      },
      content: function (mediaType) {
        var call = rest('content')
        return {
          search: function (q) {
            return call(mediaType, 'search', q)
          },
          stream: function (q) {
            var running
            var query = Object.assign({}, q)
            var events = new EventEmitter()
            var next = function () {
              call(mediaType, 'stream', query).then(function (hits) {
                if (running) {
                  hits.hits.forEach(function (hit) {
                    events.emit('data', hit)
                    query.last = hit.uri
                  })
                }
              }).catch(function (err) {
                if (err.code === 'ECONNRESET') return
                if (running) {
                  events.emit('error', err)
                }
              }).then(function () {
                if (running) return next()
              })
            }
            events.start = function () {
              running = true
              next()
            }
            events.stop = function () {
              running = false
            }
            return events
          },
          notification: {
            mobile: function (q) {
              return call(mediaType, 'notification/mobile', q, 'post')
            },
            email: function (q) {
              return call(mediaType, 'notification/email', q, 'post')
            },
            list: function () {
              return call(mediaType, 'notification')
            },
            delete: function (id) {
              return call(mediaType, `notification/${id}`, null, 'delete')
            }
          }
        }
      },
      user: (function () {
        var call = rest('user')
        return {
          agreement: function () {
            return call('agreement')
          },
          device: function (token) {
            return {
              register: function (opts) {
                return call('device', token, opts, 'put')
              },
              unregister: function () {
                return call('device', token, opts, 'delete')
              }
            }
          },
          profile: function (props) {
            if (!props) props = []
            return {
              get: function () {
                return call('profile', props.join(','))
              },
              put: function (profile) {
                return call('profile', props.join(','), undefined, 'put', profile)
              }
            }
          }
        }
      })()
    }
    return api
  }
}
