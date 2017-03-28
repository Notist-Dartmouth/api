app.settings.env = 'test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import passportStub from 'passport-stub';
import { app } from '../server/app';

import Article from '../server/models/article';
// import Annotation from '../server/models/annotation';
import Group from '../server/models/group';
import User from '../server/models/user';

import util from './util';

const should = chai.should();
chai.use(chaiHttp);
chai.use(chaiAsPromised);
passportStub.install(app);
// eslint comment:
/* global describe it before after beforeEach afterEach:true */

describe('Articles', function () {
  let group0 = null;
  let user = null;

  before(function () {
    return util.addUserWithGroup()
    .then(created => {
      group0 = created.group;
      user = created.user;
    });
  });

  after(function (done) {
    passportStub.logout();
    setTimeout(() => {
      Promise.all([
        Article.collection.drop(),
        Group.collection.drop(),
        User.collection.drop(),
      ]).then(res => {
        done();
      })
      .catch(err => {
        done(err);
      });
    }, 50);
  });

  beforeEach(function (done) {
    done();
  });

  afterEach(function (done) {
    passportStub.logout();
    done();
  });

  // unit tests
  describe('Article controller', function () {
    describe('createArticle', function () {
      it('should throw error on invalid input');
      it('should add article with no groups to database');
      it('should add article with groups to database, and add the article to each group');
    });

    describe('getArticle', function () {
      it('should throw error on invalid input');
      it('should resolve to null when input a uri not in database');
      it('should resolve to the correct article object when input a uri in database');
      it('should work when input a non-normalized uri');
    });

    describe('addArticleAnnotation', function () {
      it('should throw error on invalid input');
      it('should return rejecting promise if article does not exist');
      it('should update the annotations list of article if article exists');
      it('should not create duplicates in the annotations list');
    });

    describe('getArticleAnnotations', function () {
      it('should throw error on invalid input');
      it('should resolve to empty array if article is not in db');
      it('should resolve to list of public annotations if user is null');
      it('should resolve to list of annotations visible to user if user is a user object');
    });

    describe('getTopLevelAnnotations', function () {
      it('should resolve to list of just top-level public annotations if user is null');
      it('should resolve to list of just top-level user-visible annotations if passed a user object');
    });

    describe('addArticleGroups', function () {
      it('should throw error on invalid input');
      it('should return rejecting promise if article does not exist');
      it('should update the groups list of article if article exists');
      it('should not create duplicates in the groups list');
    });

    describe('getArticleGroups', function () {
      it('should throw error on invalid input');
      it('should return rejecting promise if article does not exist');
      it('should resolve to array of groups article belongs to');
    });
  });

  describe('API calls', function () {
    describe('POST /api/articles', function () {
      it('should return 401 error for unauthenticated user', function () {
        const uri = 'www.unauthenticatedURI.com';
        const nURI = Article.normalizeURI(uri);
        const title = 'Unauthenticated';
        chai.request(app)
          .post('/api/article')
          .send({ uri, title, groups: [] })
          .end((err, res) => {
            should.not.exist(err);
            should.exist(res);
            res.should.have.status(401);
          });

        return util.checkDatabase((resolve) => {
          resolve(Article.findOne({ uri: nURI }).should.eventually.equal.null);
        });
      });

      it('should add a single article with no groups', function () {
        const uri = 'www.noGroupURI.com';
        const nURI = Article.normalizeURI(uri);
        passportStub.login(user);
        chai.request(app)
          .post('/api/article')
          .send({ uri, groups: [] })
          .end((err, res) => {
            should.not.exist(err);
            should.exist(res);
            res.should.have.status(200);
            res.should.be.json;
            res.should.have.deep.property('body.SUCCESS');
            res.body.SUCCESS.should.have.property('uri', nURI); // TODO: something about this line errors !!
            res.body.SUCCESS.should.have.property('title');
            res.body.SUCCESS.should.have.property('groups').that.is.empty;
            res.body.SUCCESS.should.have.property('annotations').that.is.empty;
          });

        return util.checkDatabase((resolve) => {
          const articleQuery = Article.findOne({ uri: nURI });
          resolve(Promise.all([
            articleQuery.should.eventually.have.property('groups').that.is.empty,
            articleQuery.should.eventually.have.property('uri', nURI),
            articleQuery.should.eventually.have.property('title'),
            articleQuery.should.eventually.have.property('annotations').that.is.empty,
          ]));
        });
      });

      it('should return error because try to add article to fake group', function () {
        const uri = 'www.fakeGroupURI.com';
        const groupId = '123412341234123412341234';
        passportStub.login(user);
        chai.request(app)
          .post('/api/article')
          .send({ uri, groups: [groupId] })
          .end((err, res) => {
            should.not.exist(err);
            should.exist(res);
            res.should.have.status(200);
            res.should.be.json;
            res.should.have.deep.property('body.ERROR.message');
          });

        // ensure database hasn't changed
        return util.checkDatabase((resolve) => {
          resolve(Promise.all([
            Article.findOne({ uri }).should.eventually.equal.null,
            Group.findById(groupId).should.eventually.equal.null,
          ]));
        });
      });

      it('should add article to group with proper references in both documents', function () {
        const uri = 'www.oneGroupURI.com';
        const nURI = Article.normalizeURI(uri);
        passportStub.login(user);
        chai.request(app)
          .post('/api/article')
          .send({ uri, groups: [group0._id] })
          .end((err, res) => {
            should.not.exist(err);
            should.exist(res);
            res.should.have.status(200);
            res.should.be.json;
            res.should.have.deep.property('body.SUCCESS');
            res.body.SUCCESS.should.have.property('uri', nURI);
            res.body.SUCCESS.should.have.property('title');
            res.body.SUCCESS.should.have.property('annotations').that.is.empty;
            res.body.SUCCESS.should.have.property('groups').with.members([group0._id.toString()]);
          });

        return util.checkDatabase((resolve) => {
          const articleQuery = Article.findOne({ uri: nURI });
          const groupQuery = Group.findById(group0._id);
          resolve(Promise.all([
            articleQuery.should.eventually.have.property('uri', nURI),
            articleQuery.should.eventually.have.property('title'),
            articleQuery.should.eventually.have.property('annotations').that.is.empty,
            articleQuery.then(article => {
              article.groups.map(String).should.have.members([group0._id.toString()]);
              const articleId = article._id;
              return groupQuery.then(group => {
                group.articles.map(String).should.have.members([articleId.toString()]);
              });
            }),
          ]));
        });
      });
    });
  });
});
