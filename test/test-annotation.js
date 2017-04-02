process.env.NODE_ENV = 'test';
app.settings.env = 'test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import passportStub from 'passport-stub';
import { app } from '../server/app';

import Article from '../server/models/article';
import Annotation from '../server/models/annotation';
import Group from '../server/models/group';
import User from '../server/models/user';

import util from './util';

chai.should();

chai.use(chaiHttp);
passportStub.install(app);
// eslint comment:
/* global describe it before after:true */

describe('Annotations', function () {
  let GroupA;
  let ArticleA;
  let user;

  before(function () {
    return util.addUserWithGroup()
    .then(created => {
      GroupA = created.group;
      user = created.user;
      return util.addArticleInGroup(null, 'www.nytimes.com/articleA');
    })
    .then(newArticle => {
      ArticleA = newArticle;
    });
  });

  after(function (done) {
    passportStub.logout();
    setTimeout(() => {
      Promise.all([
        Article.collection.drop(),
        Group.collection.drop(),
        User.collection.drop(),
        Annotation.collection.drop(),
      ]).then(res => {
        done();
      })
      .catch(err => {
        done(err);
      });
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

    it('should add annotation to new article in general group', function () {
      const uri = 'www.nytimes.com/articleB';
      const articleText = 'This is a new article';
      const text = 'This is my annotation';
      const isPublic = true;
      const ranges = [{
        end: '/div[2]/section[1]/div[1]/div[1]/div[2]/div[1]/p[1]',
        endOffset: 64,
        start: '/div[2]/section[1]/div[1]/div[1]/div[2]/div[1]/p[1]',
        startOffset: 50,
      }];
      passportStub.login(user);
      chai.request(app)
      .post('/api/annotation')
      .send({
        uri,
        groups: [],
        articleText,
        ranges,
        text,
        isPublic,
        parentId: null,
      })
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.articleText.should.equal(articleText);
        res.body.SUCCESS.ranges.should.eql(ranges);
        res.body.SUCCESS.text.should.equal(text);
        res.body.SUCCESS.isPublic.should.be.true;
      });

      // let database update
      return util.checkDatabase(resolve => {
        resolve(true);
      });
    });

    it('should add annotation to new article in a public group');
    it('should add annotation to articleA in groupA', function () {
      const articleText = 'This is another article';
      const text = 'This is annotationA for articleA';
      const isPublic = false;
      const ranges = [{
        end: '/p[69]/span/span',
        endOffset: 120,
        start: '/p[70]/span/span',
        startOffset: 0,
      }];
      passportStub.login(user);
      chai.request(app)
      .post('/api/annotation')
      .send({
        uri: ArticleA.uri,
        groups: [GroupA.id],
        articleText,
        ranges,
        text,
        isPublic,
        parentId: null,
      })
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.articleText.should.equal(articleText);
        res.body.SUCCESS.ranges.should.eql(ranges);
        res.body.SUCCESS.text.should.equal(text);
      });

      return util.checkDatabase(resolve => {
        const articleQuery = Article.findOne({ uri: ArticleA.uri });
        resolve(Promise.all([
          articleQuery.should.eventually.have.property('groups', GroupA._id),
        ]));
      });
    });

    it('should add annotation in private and public group to articleA', function () {
      const articleText = 'ArticleA is more interesting than ArticleB';
      const text = 'This is annotationB for articleA';
      const isPublic = true;
      const ranges = [{
        end: '/p[69]/span/span',
        endOffset: 12,
        start: '/p[70]/span/span',
        startOffset: 1,
      }];
      passportStub.login(user);
      chai.request(app)
      .post('/api/annotation')
      .send({
        uri: ArticleA.uri,
        groups: [GroupA.id],
        articleText,
        ranges,
        text,
        isPublic,
      })
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.articleText.should.equal(articleText);
        res.body.SUCCESS.ranges.should.eql(ranges);
        res.body.SUCCESS.text.should.equal(text);
      }); // INSTEAD OF DONE, we should make sure its in db ?

      return util.checkDatabase(resolve => {
        resolve(true);
      });
    });

    it('should return all annotations on articleA visible to user', function () {
      passportStub.login(user);
      chai.request(app)
      .get(`/api/article/annotations?uri=${ArticleA.uri}`)
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body[0].should.have.property('articleText');
        res.body[0].should.have.property('text');
      });

      return util.checkDatabase(resolve => {
        resolve(true);
      });
    });

    it('should return annotations in groupA on articleA');
    it('should delete annotation with no replies' function() {
      passportStub.login(user);
      chai.request(app)
      .delete(`/api/annotation/${AnnotationA.id}`)
      .end(function(err, res) {
        res.should.have.status(200);
      });

      return util.checkDatabase(resolve => {
        resolve(true);
      });
    });

  });

  describe('AnnotationReplies', function () {
    let PublicAnnotation, PrivateAnnotation;

    before(function () {
      util.addArticleAnnotation(ArticleA._id, null, 'This is a public annotation').then(newAnnotation => {
        PublicAnnotation = newAnnotation;
      });
      util.addArticleAnnotation(ArticleA._id, GroupA._id, 'This is a private annotation', false)
      .then(newAnnotation => {
        PrivateAnnotation = newAnnotation;
      });
    });

    it('should post reply annotation the general group', function () {
      const publicText = 'This is a public reply';

      passportStub.login(user);
      chai.request(app)
      .post('/api/annotation')
      .send({
        uri: ArticleA.uri,
        parent: PublicAnnotation._id,
        text: publicText,
      })
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.isPublic.should.be.true;
        res.body.SUCCESS.parent.should.eql(PublicAnnotation._id.toString());
        res.body.SUCCESS.text.should.eql(publicText);
      });

      return util.checkDatabase(resolve => {
        resolve(true);
      });
    });

    it('should post reply annotation in private group', function (done) {
      const privateText = 'This is a private reply';
      passportStub.login(user);
      chai.request(app)
      .post('/api/annotation')
      .send({
        uri: ArticleA.uri,
        parent: PrivateAnnotation._id,
        text: privateText,
      })
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.isPublic.should.be.false;
        res.body.SUCCESS.groups.should.include(GroupA._id.toString());
        res.body.SUCCESS.text.should.eql(privateText);
        done();
      });
    });

    it('should list all replies on public annotation', function (done) {
      passportStub.login(user);
      chai.request(app)
      .get(`/api/annotation/${PublicAnnotation._id}/replies`)
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('result');
        res.body.result.should.be.an('array');
        res.body.result.should.have.length(1);
        res.body.result[0].isPublic.should.be.true;
        done();
      });
    });

    it('should list all replies on private annotation', function (done) {
      passportStub.login(user);
      chai.request(app)
      .get(`/api/annotation/${PrivateAnnotation._id}/replies`)
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('result');
        res.body.result.should.be.an('array');
        res.body.result.should.have.length(1);
        res.body.result[0].isPublic.should.be.false;
        res.body.result[0].groups.should.include(GroupA._id.toString());
        done();
      });
    });
  });
});


/* annotations */
/* groups */
