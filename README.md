# JavaScript client for TT APIs

![Version](http://img.shields.io/npm/v/tt-api-client.svg) &nbsp;
![License](http://img.shields.io/npm/l/tt-api-client.svg) &nbsp;
![Monthly downloads](http://img.shields.io/npm/dm/tt-api-client.svg) &nbsp;
![Build Status](https://ci2.tt.se/buildStatus/icon\?job\=ttab/tt-api-client/master)

## Content API

    const Api = require('tt-api-client')
    const api = Api().token(process.env.TOKEN)
    
    # searching
    api.content('text').search({q: 'panda'}).then(function (res) {
      console.log(res)
    }).catch(function (err) {
      console.error(err)
    })
    
    # streaming updates
    var images = api.content('image').stream({q: 'panda'})
    images.on('data', function (data) {
      console.log(data)
    })
    images.on('error', function (err) {
      console.error(err.message)
    })
    images.start()

