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

describe('Users', function () {
  it('should create new user');
});

describe('Groups', function () {
  it('should post new group');
  it('should add user to group');
});
/* groups */

describe('Articles', function () {
  Article.collection.drop();

  before(function (done) {
    // TODO: figure out how to authenticate user
    // before each test, create new group and add article
    var newGroup = new Group({
      name: 'FirstGroup',
      description: 'this is a test group',
    });

    var newArticle = new Article({
      uri: 'www.thisisauri.com',
      group: '1234',
    });

    newArticle.save(function (err) {
      done();
    });
  });
  after(function (done) {
    Article.collection.drop();
    done();
  });

  it('should add a single article on /api/articles POST', function (done) {
    chai.request(server.app)
      .post('/api/article')
      .send({ 'uri': 'www.nytimes.com' })  // TO DO add group ?
      .end(function (err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property(SUCCESS);
        res.body.SUCCESS.should.be.a('object');
        res.body.SUCCESS.should.have.property('_id');
        res.body.SUCCESS.should.have.property('groups');
        res.body.SUCCESS.should.have.property('uri');
        res.body.SUCCESS.uri.should.equal('www.nytimes.com');
        done(); // TODO: Add more here
      });
  });

  it('should return error because try to add article to fake group');

  // TODO: deprecated -- change to be getGroupArticles
  it('should list all articles in group on /api/articles GET');
  // function (done) {
  //   chai.request(server.app)
  //     .get('/api/article')
  //     .end(function (err, res) {
  //       res.should.have.status(200);
  //       res.should.be.json;
  //       res.should.be.a('array');
  //       res.body[0].should.have.property('_id');
  //       res.body[0].should.have.property('groups');
  //       res.body[0].should.have.property('uri');
  //       res.body[0].uri.should.equal('www.thisisauri.com');
  //       done(); // TODO: ADD MORE HERE
  //     });
  // });
});

/* annotations */
describe('Annotations', function () {
  describe('FirstAnnotation', function () {
    it('should add annotation to new article in public group');
    it('should add annotation to already existing article');
    it('should add annotation to private and public group');
    it('should return all annotations on particular article');
  });

  describe('AnnotationReplies', function () {
    it('should post reply annotation in public group');
    it('should post reply annotation in private group');
    it('should list all replies on annotation for private group');
    it('should list all replies on annotation for public group');
  });
});
