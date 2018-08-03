module.exports = function (EventEmitter, request) {
  return function (opts) {
    opts = Object.assign({host: 'https://api.tt.se'}, opts)
    var token, running
    var rest = function (mt, op, q) {
      return new Promise(function (resolve, reject) {
        request.get({
          url: opts.host + '/content/v1/' + mt + '/' + op,
          qs: q,
          headers: {'Authorization': 'Bearer ' + token}
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
            {statusCode: response.statusCode}, data))
        })
      })
    }

    var api = {
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
            var query = Object.assign({}, q)
            var events = new EventEmitter()
            var next = function () {
              rest(mediaType, 'stream', query).then(function (hits) {
                hits.hits.forEach(function (hit) {
                  events.emit('data', hit)
                  query.last = hit.uri
                })
              }).catch(function (err) {
                events.emit('error', err)
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
          }
        }
      }
    }
    return api
  }
}
