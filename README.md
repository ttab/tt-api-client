# Browser-friendly JavaScript client for public TT APIs

![Version](http://img.shields.io/npm/v/@ttab/api-client.svg) &nbsp;
![License](http://img.shields.io/npm/l/@ttab/api-client.svg) &nbsp;
![Monthly downloads](http://img.shields.io/npm/dm/@ttab/api-client.svg) &nbsp;
![Build Status](https://ci2.tt.se/buildStatus/icon\?job\=ttab/tt-api-client/master)

## Supported APIs

See (https://api.tt.se/docs) for API documentation.

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

    # create a notification
    api.content('image').notification.create({
      title: 'my notification',
      type: 'mobile',
      q: 'panda'
    }).then(function (res) {
      console.log('created notification', res.id)
    })
    
    # list all notifications
    api.content('_all').notification.list().then(function (res) {
      console.log('my notifications', res)
    })
    
    # delete a notification
    api.content('_all').notification.delete(id)

    # get user agreements
    api.user.agreement().then(function (agrs) {
      console.log('my user agreements', agrs)
    })
