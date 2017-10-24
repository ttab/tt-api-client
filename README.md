# JavaScript client for TT APIs

![Version](http://img.shields.io/npm/v/tt-api-client.svg) &nbsp;
![License](http://img.shields.io/npm/l/tt-api-client.svg) &nbsp;
![Monthly downloads](http://img.shields.io/npm/dm/tt-api-client.svg) &nbsp;
![Build Status](https://ci2.tt.se/buildStatus/icon\?job\=ttab/tt-api-client/master)

## Push API

    var TT = require('./index')

    var client = TT.pushClient({
      ak: '<ACCESS KEY>'
    })
    
    const feed = client.feed({name: '<FEED NAME>'})

    feed.updates()
      .on('error', console.error)
      .on('update', function (data) {
        console.log(data.uri)
      }).start()

