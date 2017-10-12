var chai = require('chai')
var sinon = require('sinon')

global.expect = chai.expect
global.spy = sinon.spy
global.stub = sinon.stub

chai.use(require('chai-as-promised'))
chai.use(require('sinon-chai'))
chai.should()
