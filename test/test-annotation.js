process.env.NODE_ENV = 'test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import passportStub from 'passport-stub';
import { app } from '../server/app';

import Article from '../server/models/article';
// import Annotation from '../server/models/annotation';
import Group from '../server/models/group';
import User from '../server/models/user';

import util from './util';

chai.should();

chai.use(chaiHttp);
passportStub.install(app);
// eslint comment:
/* global describe it before after:true */

describe('Annotations', function () {
  let Group0;
  let ArticleA;
  let user;
  before(function (done) {
    const created = util.addUserWithGroup();
    Group0 = created.group;
    user = created.user;
    ArticleA = util.addArticleInGroup(Group0._id, 'www.nytimes.com/articleA');
    done();
  });
  after(function (done) {
    setTimeout(() => {
      Article.collection.drop(err => {});
      Group.collection.drop(err => {});
      User.collection.drop(err => {});
      passportStub.logout();
      done();
    }, 50);
  });

  describe('FirstAnnotation', function () {
    it('should return 401 error for unauthenticated user', function (done) {
      chai.request(app)
      .post('/api/annotation')
      .send({
        uri: 'hello.com',
      })
      .end(function (err, res) {
        res.should.have.status(401);
        done();
      });
    });

    it('should add annotation to new article in general group', function (done) {
      const uri = 'www.nytimes.com/articleB';
      const articleText = 'This is a new article';
      const text = 'This is my annotation';
      const isPublic = true;
      passportStub.login(user);
      chai.request(app)
      .post('/api/annotation')
      .send({
        uri,
        groups: [],
        articleText,
        text,
        isPublic,
      })
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.articleText.should.equal(articleText);
        res.body.SUCCESS.text.should.equal(text);
        res.body.SUCCESS.isPublic.should.be.true;
        done();
      });
    });

    it('should add annotation to new article in a public group');
    it('should add annotation to articleA in groupA', function (done) {
      const articleText = 'This is another article';
      const text = 'This is annotationA for articleA';
      const isPublic = false;
      passportStub.login(user);
      chai.request(app)
      .post('/api/annotation')
      .send({
        'uri': ArticleA.uri,
        'groupIds': [GroupA.id],
        articleText,
        text,
        isPublic,
      }).end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.articleText.should.equal(articleText);
        res.body.SUCCESS.text.should.equal(text);
        done();
      });
    });
    it('should add annotation in private and public group to articleA', function (done) {
      const articleText = 'ArticleA is more interesting than ArticleB';
      const text = 'This is annotationB for articleA';
      const isPublic = true;
      passportStub.login(user);
      chai.request(app)
      .post('/api/annotation')
      .send({
        'uri': ArticleA.uri,
        'groupIds': [GroupA.id],
        articleText,
        text,
        isPublic,
      }).end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.articleText.should.equal(articleText);
        res.body.SUCCESS.text.should.equal(text);
        done();
      }); // INSTEAD OF DONE, we should make sure its in db ?
    });
    it('should return all public annotations on articleA', function (done) {
      passportStub.login(user);
      chai.request(app)
      .get(`/api/article/${ArticleA.id}/annotations`)
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('result');
        res.body.result.should.be.a('array');
        res.body.result[0].should.have.property('articleText');
        res.body.result[0].should.have.property('text');
        done();
      });
    });
    it('should return annotations in groupA on articleA');
  });

  describe('AnnotationReplies', function () {
    it('should post reply annotatin the general group');
    it('should post reply annotatin a public group');
    it('should post reply annotation in private group');
    it('should list all replies on annotation in public group');
    it('should list all replies on annotation in private group');
  });
});


/* annotations */
/* groups */
