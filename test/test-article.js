// command: mocha --require babel-register
process.env.NODE_ENV = 'test';

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

  before(function beforeCB(done) {
    const created = util.addUserWithGroup();
    group0 = created.group;

    Article.collection.drop();
    Group.collection.drop();
    User.collection.drop();

    user = created.user;
    done();
  });

  after(function afterCB(done) {
    setTimeout(() => {
      Article.collection.drop(err => {});
      Group.collection.drop(err => {});
      User.collection.drop(err => {});
      passportStub.logout();
      done();
    }, 50);
  });

  beforeEach(function beforeEachCB(done) {
    done();
  });

  afterEach(function afterEachCB(done) {
    passportStub.logout();
    done();
  });

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
      const title = 'No Groups';
      passportStub.login(user);
      chai.request(app)
        .post('/api/article')
        .send({ uri, title, groups: [] })
        .end((err, res) => {
          should.not.exist(err);
          should.exist(res);
          res.should.have.status(200);
          res.should.be.json;
          res.should.have.deep.property('body.SUCCESS');
          res.body.SUCCESS.should.have.property('uri', nURI); // TODO: something about this line errors !!
          res.body.SUCCESS.should.have.property('title', title);
          res.body.SUCCESS.should.have.property('groups').that.is.empty;
          res.body.SUCCESS.should.have.property('annotations').that.is.empty;
        });

      return util.checkDatabase((resolve) => {
        const articleQuery = Article.findOne({ uri: nURI });
        resolve(Promise.all([
          articleQuery.should.eventually.have.property('groups').that.is.empty,
          articleQuery.should.eventually.have.property('uri', nURI),
          articleQuery.should.eventually.have.property('title', title),
          articleQuery.should.eventually.have.property('annotations').that.is.empty,
        ]));
      });
    });

    it('should return error because try to add article to fake group', function () {
      const uri = 'www.fakeGroupURI.com';
      const title = 'Fake Group';
      const groupId = '123412341234123412341234';
      passportStub.login(user);
      chai.request(app)
        .post('/api/article')
        .send({ uri, title, groups: [groupId] })
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
      const title = 'One Group';
      const nURI = Article.normalizeURI(uri);
      passportStub.login(user);
      chai.request(app)
        .post('/api/article')
        .send({ uri, title, groups: [group0._id] })
        .end((err, res) => {
          should.not.exist(err);
          should.exist(res);
          res.should.have.status(200);
          res.should.be.json;
          res.should.have.deep.property('body.SUCCESS');
          res.body.SUCCESS.should.have.property('uri', nURI);
          res.body.SUCCESS.should.have.property('title', title);
          res.body.SUCCESS.should.have.property('annotations').that.is.empty;
          res.body.SUCCESS.should.have.property('groups').with.members([group0._id.toString()]);
        });

      return util.checkDatabase((resolve) => {
        const articleQuery = Article.findOne({ uri: nURI });
        const groupQuery = Group.findById(group0._id);
        resolve(Promise.all([
          articleQuery.should.eventually.have.property('uri', nURI),
          articleQuery.should.eventually.have.property('title', title),
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
