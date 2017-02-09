// command: mocha --compilers js:babel-core/register
process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var mongoose = require("mongoose");

var server = require('../app/server');
var Article = require('../app/models/article'));

var should = chai.should();
chai.use(chaiHttp);

describe('Articles', function () {
  it('should list ALL articles on /api/articles GET', function (done) {
    chai.request(server.app)
      .get('/api/article')
      .end(function (err, res) {
        res.should.have.status(200);  // right now I think even errors come back with 200 ?
        res.should.be.json;
        done();
      });
  });
  it('should add a single article on /api/articles POST');
});
