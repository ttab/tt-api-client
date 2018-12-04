/* global describe,it,location */

var token

function loadApi () {
  if (typeof window === 'undefined') {
    let token = process.env.TOKEN
    if (!token) throw new Error('Need access token in env var TOKEN')
    return new (require('../index'))().token(token)
  } else {
    if (!(token = location.hash.substring(1))) throw new Error('Need access token in location hash')
    return new (require('../browser'))().token(token)
  }
}

const api = loadApi()
const chai = require('chai')
const expect = chai.expect
chai.should()

describe('content', () => {
  describe('errors', () => {
    it('has a statusCode', () => {
      return api.content('panda').search().should.eventually.be.rejectedWith('Request validation failed')
        .then((e) => {
          expect(e.statusCode).to.equal(400)
        })
    })
  })

  describe('search', () => {
    it('returns a search result', () => {
      return api.content('image').search().then(res => {
        expect(res).to.be.instanceOf(Object)
        expect(res).to.have.property('hits')
        expect(res.hits).to.be.instanceOf(Array)
      })
    }).timeout(5000)

    it('accepts the _all mediaType', () => {
      return api.content('_all').search().then(res => {
        expect(res).to.be.instanceOf(Object)
        expect(res).to.have.property('hits')
        expect(res.hits).to.be.instanceOf(Array)
      })
    })
  })

  describe('stream', () => {
    it('emits data events', done => {
      var stream = api.content('_all').stream()
      stream.once('data', data => {
        expect(data).to.have.property('uri')
        stream.stop()
        done()
      })
      stream.start()
    }).timeout(60000)
  })

  describe('notification', () => {
    it('can be created, listed, and deleted', () => {
      return Promise.resolve().then(() => {
        return api.content('text').notification.mobile({
          q: 'panda',
          title: '__all the pandas__'
        }).then(res => {
          expect(res).to.have.property('id')
          expect(res).to.have.property('title', '__all the pandas__')
          expect(res).to.have.property('mediaType', 'text')
          expect(res).to.have.property('q', 'panda')
          expect(res).to.have.property('type', 'mobile')
        })
      }).then(() => {
        return api.content('text').notification.list().then(res => {
          expect(res).to.be.instanceOf(Array)
          return res.filter((n) => {
            return n.title === '__all the pandas__'
          })
        }).then((found) => {
          expect(found.length).to.be.at.least(1)
          return found.reduce((p, n) => {
            return p.then(() => {
              return api.content(n.mediaType).notification.delete(n.id)
            })
          }, Promise.resolve())
        })
      }).then(() => {
        return api.content('text').notification.list().then(res => {
          return res.filter((n) => {
            return n.title === '__all the pandas__'
          })
        }).then(res => {
          expect(res).to.be.instanceOf(Array)
          expect(res.length).to.equal(0)
        })
      })
    }).timeout(10000)
  })
})

describe('user', () => {
  describe('agreement', () => {
    it('can get agreements', () => {
      return api.user.agreement().then(res => {
        expect(res).to.be.instanceOf(Array)
      })
    })
  })

  describe('device', () => {
    it('can register and unregister devices', () => {
      var token = 'abcd-1234-PANDA'
      return api.user.device(token).register({
        type: 'ios-sandbox',
        model: 'iPhone X'
      }).then(res => {
        return api.user.device(token).unregister()
      })
    }).timeout(10000)
  })

  describe('profile', () => {
    it('can get the user profile', () => {
      return api.user.profile().get().then(profile => {
        expect(profile).to.have.property('user')
      })
    })

    it('can get selected properties of the user profile', () => {
      return api.user.profile(['user']).get().then(profile => {
        expect(profile).to.have.property('user')
      })
    })

    it('can update the user profile', () => {
      let p = api.user.profile(['panda'])
      return p.put({ panda: true })
        .then(p.get).then(profile => {
          expect(profile).to.have.property('panda', true)
        })
        .then(() => {
          return p.put({ panda: false })
        })
        .then(p.get).then(profile => {
          expect(profile).to.have.property('panda', false)
        })
    }).timeout(10000)
  })
})
