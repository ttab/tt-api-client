# JaveScript client for TT APIs

## Push API

    var TT = require('./index')

    var client = TT.pushClient({
      ak: '<ACCESS KEY>',
      name: '<FEED NAME>'
    })

    client.on('error', console.error)
    client.on('update', function (data) {
      console.log(data.uri)
    })

    console.log('waiting for news...')
    client.start()
