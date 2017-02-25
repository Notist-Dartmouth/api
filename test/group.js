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

describe('Groups', function () {
  /* Group.collection.drop();*/

  // beforeEach(function (done) {
  //   var newGroup;
  //   var newArticle = new Article({
  //     uri: 'www.thisisauri.com',
  //     group: '1234',
  //   });
  //   newArticle.save(function (err) {
  //     done();
  //   });
  // });
  beforeEach(function (done) {
    var newGroup = new Group({
      name: 'test group name',
      description: 'test group description',
      creator: '123412341234123412341234',
      articles: ['111111111111111111111111', '222222222222222222222222'],
      members: ['123412341234123412341234', '234523452345234523452345'],
    });
    newGroup.save(function (err) {
      done();
    });
  });

  afterEach(function (done) {
  /*  Article.collection.drop();*/
    done();
  });

  it('should list ALL articles on /api/articles GET', function (done) {
    chai.request(server.app)
      .get('/api/article')
      .end(function (err, res) {
        res.should.have.status(200);
        res.should.be.json;
        done(); // TODO: ADD MORE HERE
      });
  });
  it('should add a single article on /api/articles POST', function (done) {
    chai.request(server.app)
      .post('/api/article')
      .send({ 'uri': 'www.nytimes.com' })
      .end(function (err, res) {
        res.should.have.status(200);
        res.should.be.json;
        done(); // TODO: Add more here
      });
  });
});


/* annotations */
/* groups */
