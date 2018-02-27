module.exports = function (EventEmitter, request) {
  return function (opts) {
    opts = Object.assign({host: 'http://localhost:3100'}, opts)
    const rest = function (mt, op, q) {
      return new Promise(function (resolve, reject) {
        request.get({
          url: opts.host + '/content/v1/' + mt + '/' + op,
          qs: q,
          headers: {'Authorization': 'Bearer ' + opts.token},
          strictSSL: false
        }, function (err, response, body) {
          if (err) return reject(err)
          if (response.statusCode === 200) {
            return resolve(JSON.parse(body))
          }
          reject(new Error('status ' + response.statusCode))
        })
      })
    }

    return {
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
  }
}
