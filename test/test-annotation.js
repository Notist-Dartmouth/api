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
    it('should return 401 error for unathenticated user trying to submit annotation', function (done) {
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

    // TODO: we don't yet have a conception of a public group do we?
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
      });
    });
    it('should return all public annotations on articleA', function (done) {
      passportStub.login(user);
      chai.request(app)
      .get(`/api/article/${ArticleA.id}/annotations`)
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('result');
        res.body.result.should.be.a('array');
      //  res.body.result[0].should.have.property('articleText');
      //  res.body.result[0].should.have.property('text');
        done();
      });
    });
  });

  describe('AnnotationReplies', function () {
    let AnnotationA;
    let AnnotationB;
    before(function (done) {
      AnnotationA = util.addArticleAnnotation(ArticleA._id, GroupA._id);
      AnnotationB = util.addArticleAnnotation(ArticleA._id, GroupA._id, 'Test B', false);
      done();
    });
    it('should post reply annotation in the general group', function (done) {
      const replyText = 'This annotation makes an interesting point.';
      passportStub.login(user);
      chai.request(app)
      .post('/api/annotation')
      .send({
        'uri': ArticleA.uri,
        'text': replyText,
        'parentId': AnnotationA._id,
      })
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.articleText.should.equal(AnnotationA.articleText);
        res.body.SUCCESS.should.have.property('parent');
        res.body.SUCCESS.parent.should.equal(AnnotationA._id.toString());
        res.body.SUCCESS.text.should.equal(replyText);
        done();
      });
    });
    it('should post reply annotation a public group'); // TODO: we dont have this yet do we? is it any different than a group?
    it('should post reply annotation in private group', function (done) {
      done();
    });
    it('should list all replies on annotation in general group', function (done) {
      done();
    });
    it('should list all replies on annotation in private group', function (done) {
      done();
    });
  });
});


/* annotations */
/* groups */
