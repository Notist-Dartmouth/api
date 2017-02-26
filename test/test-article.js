// command: mocha --require babel-register
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

const should = chai.should();
chai.use(chaiHttp);
passportStub.install(app);
// eslint comment:
/* global describe it before beforeEach afterEach:true */

describe('Articles', function () {
  let groupA = null;
  let user = null;

  before(function (done) {
    Article.collection.drop();
    Group.collection.drop();
    User.collection.drop();

    const created = util.addUserWithGroup('user', 'GroupA');
    groupA = created.group;
    user = created.user;
    done();
  });

  beforeEach(function (done) {
    done();
  });

  afterEach(function (done) {
    Article.collection.drop();
    Group.collection.drop();
    passportStub.logout();
    done();
  });

  it('should add a single article with no groups on /api/articles POST', function (done) {
    const uri = 'www.nytimes.com';
    passportStub.login(user);
    chai.request(app)
      .post('/api/article')
      .send({ uri, groupIds: [] })
      .end((err, res) => {
        should.not.exist(err);
        should.exist(res);
        res.should.have.status(200);
        res.should.be.json;
        res.should.have.property('body');
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.should.have.property('uri');
        res.body.SUCCESS.uri.should.equal(uri);
        res.body.SUCCESS.should.have.property('groups');
        res.body.SUCCESS.groups.should.be.empty;
        res.body.SUCCESS.should.have.property('annotations');
        res.body.SUCCESS.annotations.should.be.empty;
        done();
      });
  });

  it('should return error because try to add article to fake group');
  it('should add article to group with proper references in both documents');
});
