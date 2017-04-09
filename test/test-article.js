import { app } from '../server/app';
process.env.NODE_ENV = 'test';
app.settings.env = 'test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import passportStub from 'passport-stub';

import Article from '../server/models/article';
// import Annotation from '../server/models/annotation';
import Group from '../server/models/group';
import User from '../server/models/user';

import * as Articles from '../server/controllers/article_controller';

import util from './util';

const should = chai.should();
chai.use(chaiHttp);
chai.use(chaiAsPromised);
passportStub.install(app);
// eslint comment:
/* global describe it before after beforeEach afterEach:true */

describe('Articles', function () {
  let group0 = null;
  let group1 = null;
  let user = null;
  let testArticle = null;
  const testArticleURI = Article.normalizeURI('www.testArticle.com');
  const fakeObjectId = '123412341234123412341234';

  before(function () {
    return util.addUserWithNGroups(2)
    .then((created) => {
      group0 = created.groups[0];
      group1 = created.groups[1];
      user = created.user;

      return util.addArticle(testArticleURI);
    })
    .then((article) => {
      testArticle = article;
    });
  });

  after(function (done) {
    passportStub.logout();
    setTimeout(() => {
      Promise.all([
        Article.collection.drop(),
        Group.collection.drop(),
        User.collection.drop(),
      ]).then((res) => {
        done();
      })
      .catch((err) => {
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

    describe('getArticlesFiltered', function () {
      it('should throw error on invalid input', function () {
        return Promise.all([
          Articles.getArticlesFiltered().should.eventually.be.rejected,
          Articles.getArticlesFiltered('notAnObject').should.eventually.be.rejected,
        ]);
      });

      it('should resolve to empty array when no articles match conditions', function () {
        return Articles.getArticlesFiltered({ uri: 'wronguri.com' }).should.eventually.be.empty;
      });

      it('should resolve to list of article objects that match conditions', function () {
        return Articles.getArticlesFiltered({ uri: testArticleURI })
        .then((result) => {
          result.should.have.lengthOf(1);
          result[0].title.should.equal(`Article at ${testArticleURI}`);
          result[0].id.should.equal(testArticle.id);
        });
      });
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
      let myArticle = null;
      before(function () {
        // add article we need for the tests
        return util.addArticleInGroups([group0._id, group1._id])
        .then((article) => {
          myArticle = article;
        });
      });

      after(function () {
        return Article.collection.drop();
      });

      it('should reject on invalid input', function () {
        return Promise.all([
          Articles.getArticleGroups().should.eventually.be.rejected,
          Articles.getArticleGroups(123).should.eventually.be.rejected,
          Articles.getArticleGroups('notObjectId').should.eventually.be.rejected,
          Articles.getArticleGroups(fakeObjectId).should.eventually.be.rejected,
        ]);
      });

      it('should resolve to array of groups article belongs to', function () {
        return Articles.getArticleGroups(myArticle._id)
        .then((groups) => {
          groups.should.have.lengthOf(2);
          for (let i = 0; i < 2; i++) {
            groups[i].should.have.property('name').match(/Group/);
            groups[i].should.have.property('description');
            groups[i].should.have.property('members').include(user.id);
            groups[i].should.have.property('creator');
            groups[i].creator.toString().should.equal(user.id);
          }
          groups[0].id.should.not.equal(groups[1].id);
        });
      });
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
            should.exist(err);
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
            articleQuery.then((article) => {
              article.groups.map(String).should.have.members([group0._id.toString()]);
              const articleId = article._id;
              return groupQuery.then((group) => {
                group.articles.map(String).should.have.members([articleId.toString()]);
              });
            }),
          ]));
        });
      });
    });
  });
});
