import chai from 'chai';
import chaiHttp from 'chai-http';
import passportStub from 'passport-stub';
import { app } from '../server/app';

import Article from '../server/models/article';
import Annotation from '../server/models/annotation';
import Group from '../server/models/group';
import User from '../server/models/user';

import util from './util';

const should = chai.should();

chai.use(chaiHttp);
passportStub.install(app);
// eslint comment:
/* global describe it before after:true */

describe('Annotations', function () {
  let GroupA;
  let ArticleA;
  let user;
  let user2;

  before(function () {
    return util.addNUsersWithNGroups(2, 1)
    .then((created) => {
      GroupA = created.groups[0];
      user = created.users[0];
      user2 = created.users[1];
      return util.addArticle('www.nytimes.com/articleA');
    })
    .then((newArticle) => {
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
      ]).then((res) => {
        done();
      })
        .catch((err) => {
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
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.articleText.should.equal(articleText);
        res.body.SUCCESS.ranges.should.eql(ranges);
        res.body.SUCCESS.text.should.equal(text);
        res.body.SUCCESS.isPublic.should.be.true;
      });

      // let database update
      return util.checkDatabase((resolve) => {
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

      return util.checkDatabase((resolve) => {
        resolve(Article.findOne({ uri: ArticleA.uri })
        .then((article) => {
          article.should.have.property('groups').with.lengthOf(1);
          article.groups[0].toString().should.equal(GroupA.id);
        }));
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
        res.body.SUCCESS;
      }); // INSTEAD OF DONE, we should make sure its in db ?

      return util.checkDatabase((resolve) => {
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
        res.body.should.have.length.of(2);
        res.body[0].should.have.property('articleText');
        res.body[0].should.have.property('text');
      });

      return util.checkDatabase((resolve) => {
        resolve(true);
      });
    });

    it('should return only two annotations on articleA visible to user', function (done) {
      Promise.all([
        util.addArticleAnnotation(ArticleA._id, null, user, 'This is a third annotation on ArticleA'),
        util.addArticleAnnotation(ArticleA._id, null, user, 'This is a fourth annotation on ArticleA'),
      ]).then((newAnnotations) => {
        passportStub.login(user);
        chai.request(app)
        .get(`/api/article/annotations/paginated?article=${ArticleA.id}&limit=2&toplevel=true&last=${newAnnotations[1]._id}`)
        .end(function (err, res) {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.should.have.length.of(2);
          res.body[0].should.have.property('articleText');
          res.body[0].articleText.should.eql(newAnnotations[0].articleText);
          res.body[0].should.have.property('text');
          done();
        });
      });
    });

    it('should return annotations in groupA on articleA');
  });

  let PublicAnnotation;
  let PublicReply;
  let PrivateAnnotation;
  let StupidAnnotation;
  describe('AnnotationReplies', function () {
    before(function () {
      return Promise.all([
        util.addArticleAnnotation(ArticleA._id, null, user, 'This is a public annotation'),
        util.addArticleAnnotation(ArticleA._id, GroupA._id, user, 'This is a private annotation', false),
        util.addArticleAnnotation(ArticleA._id, GroupA._id, user, 'This is a stupid annotation'),
      ])
      .then((newAnnotations) => {
        PublicAnnotation = newAnnotations[0];
        PrivateAnnotation = newAnnotations[1];
        StupidAnnotation = newAnnotations[2];
      });
    });

    it('should post reply annotation in the general group', function () {
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
        res.body.SUCCESS.parent.should.eql(PublicAnnotation.id);
        res.body.SUCCESS.text.should.eql(publicText);
      });

      return util.checkDatabase((resolve) => {
        resolve(Annotation.findOne({ text: publicText }).then((annotation) => {
          annotation.parent.toString().should.equal(PublicAnnotation.id);
          annotation.isPublic.should.be.true;
          annotation.article.toString().should.equal(ArticleA.id);
          PublicReply = annotation;
        }));
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
        res.body.should.be.an('array');
        res.body.should.have.length(1);
        res.body[0].isPublic.should.be.true;
        res.body[0].author.should.have.property('name', user.name);
        done();
      });
    });

    it('should list all replies on private annotation', function (done) {
      passportStub.login(user);
      chai.request(app)
      .get(`/api/annotation/${PrivateAnnotation._id}/replies`)
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.should.have.length(1);
        res.body[0].isPublic.should.be.false;
        res.body[0].groups.should.include(GroupA._id.toString());
        done();
      });
    });
  });

  describe('AnnotationDeletions', function () {
    let admin;
    before(function () {
      return util.addAdmin()
      .then((newAdmin) => {
        admin = newAdmin;
      });
    });

    it('should delete annotation with no replies', function () {
      passportStub.login(user);
      chai.request(app)
      .delete(`/api/annotation/${StupidAnnotation.id}`)
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('SUCCESS').that.is.true;
      });

      return util.checkDatabase((resolve) => {
        resolve(Annotation.findById(StupidAnnotation.id).should.eventually.be.null);
      });
    });

    it('should delete annotation with reply', function () {
      passportStub.login(user);
      chai.request(app)
      .delete(`/api/annotation/${PublicAnnotation.id}`)
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('SUCCESS').that.is.true;
      });

      return util.checkDatabase((resolve) => {
        resolve(Annotation.findById(PublicAnnotation.id).then((annotation) => {
          annotation.text.should.equal('[deleted]');
          annotation.numChildren.should.equal(1);
          annotation.isDeleted.should.be.true;
        }));
      });
    });

    it('should delete public reply and remove deleted parent', function () {
      passportStub.login(user);
      chai.request(app)
      .delete(`/api/annotation/${PublicReply.id}`)
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('SUCCESS').that.is.true;
      });

      return util.checkDatabase((resolve) => {
        resolve(Promise.all([
          Annotation.findById(PublicReply.id).should.eventually.be.null,
          Annotation.findById(PublicAnnotation.id).should.eventually.be.null,
        ]));
      });
    });

    it('should not let non-admin delete someone else\'s annotation', function () {
      passportStub.login(user2);
      chai.request(app)
      .delete(`/api/annotation/${PrivateAnnotation.id}`)
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('ERROR');
      });

      return util.checkDatabase((resolve) => {
        resolve(Promise.all([
          Annotation.findById(PrivateAnnotation.id).should.eventually.have.property('isDeleted').that.is.false,
          User.findById(user.id, 'notifications').should.eventually.have.property('notifications').with.lengthOf(0),
        ]));
      });
    });

    it('should let admin delete someone else\'s annotation and send notification', function () {
      passportStub.login(admin);
      chai.request(app)
      .delete(`/api/annotation/${PrivateAnnotation.id}`)
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('SUCCESS').that.is.true;
      });

      return util.checkDatabase((resolve) => {
        resolve(Promise.all([
          Annotation.findById(PrivateAnnotation.id).should.eventually.have.property('isDeleted').that.is.true,
          User.findById(user.id, 'notifications').should.eventually.have.property('notifications').with.lengthOf(1),
        ]));
      });
    });
  });

  describe('AnnotationEdits', function () {
    const updateText = 'The text of this annotation has been updated.';

    before(function () {
      return Promise.all([
        util.addArticleAnnotation(ArticleA._id, null, user, 'This is a public annotation'),
        util.addArticleAnnotation(ArticleA._id, GroupA._id, user, 'This is a private annotation', false),
      ])
      .then((newAnnotations) => {
        PublicAnnotation = newAnnotations[0];
        PrivateAnnotation = newAnnotations[1];
      });
    });

    it('should edit a public annotation', function (done) {
      passportStub.login(user);
      chai.request(app)
      .post(`/api/annotation/${PublicAnnotation.id}/edit`)
      .send({
        text: updateText,
      })
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.text.should.equal(updateText);
        res.body.SUCCESS.isEdited.should.be.true;
        done();
      });
    });

    it('should edit a private annnotation', function (done) {
      passportStub.login(user);
      chai.request(app)
      .post(`/api/annotation/${PrivateAnnotation.id}/edit`)
      .send({
        text: updateText,
      })
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.text.should.equal(updateText);
        res.body.SUCCESS.isEdited.should.be.true;
        done();
      });
    });
  });
});
