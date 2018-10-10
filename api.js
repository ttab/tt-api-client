const debug = require('debug')('tt:api')

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
        debug(method, url)
        return new Promise(function (resolve, reject) {
          request({
            method: method,
            url: url,
            qs: q,
            headers: {
              'Authorization': 'Bearer ' + token,
              'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : undefined
          }, function (err, response, body) {
            if (err) return reject(err)
            var data = null
            try {
              data = JSON.parse(body)
            } catch (err) { }
            if (response.statusCode === 200) {
              return resolve(data)
            }
            reject(Object.assign(
              new Error('status ' + response.statusCode),
              { statusCode: response.statusCode }, data))
          })
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
            create: function (q) {
              return call(mediaType, 'notification', q, 'post')
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
