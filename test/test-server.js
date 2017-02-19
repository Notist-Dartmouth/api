// command: mocha --require babel-register
process.env.NODE_ENV = 'test';

// import chai from
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const server = require('../server/app');

import Article from '../server/models/article';
import Annotation from '../server/models/annotation';
import Group from '../server/models/group';

var should = chai.should();
chai.use(chaiHttp);

describe('Articles', function () {
  /* Article.collection.drop();*/

  beforeEach(function (done) {
    // var newGroup = new Group({
    //   name:
    // });
    var newArticle = new Article({
      uri: 'www.thisisauri.com',
      group: '1234',
    });
    newArticle.save(function (err) {
      done();
    });
  });
  afterEach(function (done) {
    /* Article.collection.drop();*/
    done();
  });

  it('should list ALL articles on /api/articles GET', function (done) {
    chai.request(server.app)
      .get('/api/article')
      .end(function (err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.should.be.a('array');
        res.body[0].should.have.property('_id');
        res.body[0].should.have.property('groups');
        res.body[0].should.have.property('uri');
        res.body[0].uri.should.equal('www.thisisauri.com');
        done(); // TODO: ADD MORE HERE
      });
  });
  it('should add a single article on /api/articles POST', function (done) {
    chai.request(server.app)
      .post('/api/article')
      .send({ 'uri': 'www.nytimes.com' })  // TO DO add group ?
      .end(function (err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.should.be.a('object');
        res.body.SUCCESS.should.have.property('_id');
        res.body.SUCCESS.should.have.property('groups');
        res.body.SUCCESS.should.have.property('uri');
        res.body.SUCCESS.uri.should.equal('www.nytimes.com');
        done(); // TODO: Add more here
      });
  });
});


/* annotations */
/* groups */
