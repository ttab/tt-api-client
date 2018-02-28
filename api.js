module.exports = function (EventEmitter, request) {
  return function (opts) {
    if (!opts.host) throw new Error('host required')
    var token
    const rest = function (mt, op, q) {
      return new Promise(function (resolve, reject) {
        request.get({
          url: opts.host + '/content/v1/' + mt + '/' + op,
          qs: q,
          headers: {'Authorization': 'Bearer ' + token}
        }, function (err, response, body) {
          if (err) return reject(err)
          if (response.statusCode === 200) {
            return resolve(JSON.parse(body))
          }
          reject(new Error('status ' + response.statusCode))
        })
      })
    }

    const api = {
      token: function (_token) {
        token = _token
        return api
      },
      content: function (mediaType) {
        return {
          search: function (q) {
            return rest(mediaType, 'search', q)
          },
          stream: function (q) {
            var events = new EventEmitter()
            var next = function () {
              rest(mediaType, 'stream', q).then(function (hits) {
                hits.hits.forEach(function (hit) {
                  events.emit('hit', hit)
                })
              }).catch(function (err) {
                events.emit('error', err)
              }).then(function () {
                return next()
              })
            }
            next()
            return events
          }
        }
      }
    }
    return api
  }
}
