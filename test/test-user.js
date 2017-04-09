import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import passportStub from 'passport-stub';
import { app } from '../server/app';

import Group from '../server/models/group';
import User from '../server/models/user';

import util from './util';

const should = chai.should();
chai.use(chaiHttp);
chai.use(chaiAsPromised);
passportStub.install(app);
// eslint comment:
/* global describe it before after afterEach:true */

describe('Users', function () {
  let user0 = null; // in neither group
  let user1 = null; // in both groups

  before(function () {
    return Promise.all([
      util.addUser('user0'),
      util.addUserWithNGroups(2, 'user1'),
    ])
    .then((results) => {
      user0 = results[0];
      user1 = results[1].user;
    });
  });

  after(function () {
    passportStub.logout();
    return Promise.all([
      User.collection.drop(),
      Group.collection.drop(),
    ]);
  });

  afterEach(function () {
    passportStub.logout();
  });

  // unit tests
  describe('User controller', function () {});

  describe('API calls', function () {
    describe('GET /api/user', function () {
      it('should return 401 error for unauthenticated user', function (done) {
        // not logged in
        chai.request(app)
          .get('/api/user')
          .end((err, res) => {
            should.exist(res);
            res.should.have.status(401);
            done();
          });
      });

      it('should return user object when authenticated', function (done) {
        passportStub.login(user0);
        chai.request(app)
          .get('/api/user')
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.have.property('username', 'user0');
            res.body.should.have.property('email', 'user0@testuri.com');
            res.body.should.have.property('name', 'Test User \'user0\'');
            res.body.should.have.property('googleId', 'test_user0');
            res.body.should.have.property('groups').that.is.empty;
            done();
          });
      });

      it('should populate groups field when authenticated user is in groups', function (done) {
        passportStub.login(user1);
        chai.request(app)
          .get('/api/user')
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.have.property('username', 'user1');
            res.body.should.have.property('email', 'user1@testuri.com');
            res.body.should.have.property('name', 'Test User \'user1\'');
            res.body.should.have.property('googleId', 'test_user1');

            res.body.should.have.property('groups').with.lengthOf(2);
            res.body.groups[0]._id.toString().should.not.equal(res.body.groups[1]._id.toString());
            for (let i = 0; i < 2; i++) {
              const group = res.body.groups[i];
              group.name.should.match(/Group [0-1]/);
              group.description.should.equal(`Description of ${group.name}`);
              group.creator.toString().should.equal(user1.id);
            }
            done();
          });
      });
    });
  });
});
