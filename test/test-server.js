var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app/server');
var should = chai.should();

chai.use(chaiHttp);

describe('Articles', function () {
  it('should list ALL articles on /api/articles GET', function (done) {
    chai.request(server.app)
      .get('/api/article')
      .end(function (err, res) {
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
  });
  it('should add a single article on /api/articles POST');
});
