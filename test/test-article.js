// command: mocha --require babel-register
process.env.NODE_ENV = 'test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../server/app';
import Article from '../server/models/article';
// import Annotation from '../server/models/annotation';
// import Group from '../server/models/group';

// var should = chai.should();
chai.use(chaiHttp);

describe('Articles', function () {
  /* Article.collection.drop();*/

  beforeEach(function (done) {
    var newGroup;
    var newArticle = new Article({
      uri: 'www.thisisauri.com',
      groups: ['123412341234123412341234'],
    });
    newArticle.save(function (err) {
      done();
    });
  });
  afterEach(function (done) {
  /*  Article.collection.drop();*/
    done();
  });

  it('should add a single article on /api/articles POST', function (done) {
    chai.request(app)
      .post('/api/article')
      .send({ 'uri': 'www.nytimes.com' })
      .end(function (err, res) {
        res.should.have.status(200);
        res.should.be.an('object');
        res.should.have.property('SUCCESS');
        done(); // TODO: Add more here
      });
  });
});
