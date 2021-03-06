# api-client

Browser-friendly JavaScript client for TT Nyhetsbyrån public APIs.

![Version](http://img.shields.io/npm/v/@ttab/api-client.svg) &nbsp;
![License](http://img.shields.io/npm/l/@ttab/api-client.svg) &nbsp;
![Monthly downloads](http://img.shields.io/npm/dm/@ttab/api-client.svg) &nbsp;
![Build Status](https://ci2.tt.se/buildStatus/icon\?job\=ttab/tt-api-client/master)

## Content API

See the [API documentation](https://api.tt.se/docs) for more information.

    const Api = require('@ttab/api-client')
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

    # create a mobile notification
    api.content('image').notification.mobile({
      title: 'my notification',
      q: 'panda'
    }).then(function (res) {
      console.log('created notification', res.id)
    })

    # create an email notification
    api.content('image').notification.email({
      title: 'my notification',
      q: 'panda',
      email: 'panda@example.com'
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

    # get the user profile
    api.user.profile(['editorial', 'user']).get().then(function (profile) {
      console.log(profile)
    })

    # update the user profile
    api.user.profile(['editorial']).put({
      editorial: true,
    })

    # register a mobile device
    api.user.device(token).register({
      type: 'ios-sandbox',
      model: 'iPhone X'
    }.then(function () {
      console.log('registered!')
    })
    
    # unregister a mobile device
    api.user.device(token).unregister().then(function () {
      console.log('unregistered!')
    })
    
