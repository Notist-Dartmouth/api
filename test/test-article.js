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
  let groupA = null;
  let user = null;

  before(function beforeCB(done) {
    Article.collection.drop();
    Group.collection.drop();
    User.collection.drop();

    const created = util.addUserWithGroup('user', 'GroupA');
    groupA = created.group;
    user = created.user;

    passportStub.logout();
    done();
  });

  after(function afterCB(done) {
    Article.collection.drop(err => {});
    Group.collection.drop(err => {});
    User.collection.drop(err => {});
    passportStub.logout();
    done();
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
      chai.request(app)
        .post('/api/article')
        .send({ uri, groupIds: [] })
        .end((err, res) => {
          should.not.exist(err);
          should.exist(res);
          res.should.have.status(401);
        });

      return util.checkDatabase((resolve) => {
        resolve(Article.findOne({ uri }).should.eventually.equal.null);
      });
    });

    it('should add a single article with no groups', function () {
      const uri = 'www.noGroupURI.com';
      passportStub.login(user);
      chai.request(app)
        .post('/api/article')
        .send({ uri, groupIds: [] })
        .end((err, res) => {
          should.not.exist(err);
          should.exist(res);
          res.should.have.status(200);
          res.should.be.json;
          res.should.have.deep.property('body.SUCCESS');
          res.body.SUCCESS.should.have.property('uri', uri);
          res.body.SUCCESS.should.have.property('groups').that.is.empty;
          res.body.SUCCESS.should.have.property('annotations').that.is.empty;
        });

      return util.checkDatabase((resolve) => {
        const articleQuery = Article.findOne({ uri });
        resolve(Promise.all([
          articleQuery.should.eventually.have.property('groups').that.is.empty,
          articleQuery.should.eventually.have.property('uri', uri),
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
        .send({ uri, groupIds: [groupId] })
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
      passportStub.login(user);
      chai.request(app)
        .post('/api/article')
        .send({ uri, groupIds: [groupA._id] })
        .end((err, res) => {
          should.not.exist(err);
          should.exist(res);
          res.should.have.status(200);
          res.should.be.json;
          res.should.have.deep.property('body.SUCCESS');
          res.body.SUCCESS.should.have.property('uri', uri);
          res.body.SUCCESS.should.have.property('annotations').that.is.empty;
          res.body.SUCCESS.should.have.property('groups').with.members([groupA._id.toString()]);
        });

      return util.checkDatabase((resolve) => {
        const articleQuery = Article.findOne({ uri });
        const groupQuery = Group.findById(groupA._id);
        resolve(Promise.all([
          articleQuery.should.eventually.have.property('uri', uri),
          articleQuery.should.eventually.have.property('annotations').that.is.empty,
          articleQuery.then(article => {
            article.groups.map(String).should.have.members([groupA._id.toString()]);
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
