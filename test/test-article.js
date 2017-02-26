// command: mocha --require babel-register
process.env.NODE_ENV = 'test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../server/app';
import Article from '../server/models/article';
// import Annotation from '../server/models/annotation';
import Group from '../server/models/group';
import User from '../server/models/user';

import util from './util';

chai.should();
chai.use(chaiHttp);
// eslint comment:
/* global describe it before beforeEach afterEach:true */

describe('Articles', function () {
  let groupA = null;
  let user = null;

  before(function (done) {
    Article.collection.drop();
    Group.collection.drop();
    User.collection.drop();

    const created = util.setupUserWithGroup('user', 'GroupA');
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
    done();
  });

  it('should add a single article with no groups on /api/articles POST', function (done) {
    const testURI = 'www.nytimes.com';
    chai.request(app)
      .post('/api/article')
      .send({ uri: testURI, groupIds: [] })
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.should.have.property('body');
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.should.have.property('uri');
        res.body.SUCCESS.uri.should.equal(testURI);
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
