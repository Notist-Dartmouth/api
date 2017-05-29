import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import passportStub from 'passport-stub';
import { app } from '../server/app';
import config from '../server/_config';

import Group from '../server/models/group';
import User from '../server/models/user';
import Annotation from '../server/models/annotation';
import Article from '../server/models/article';
import * as Users from '../server/controllers/user_controller';

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
  let article0 = null;
  let annotation0 = null; // made by user0 in article0

  before(function () {
    return Promise.all([
      util.addUser('user0'),
      util.addUserWithNGroups(2, 'user1'),
      util.addArticle(),
    ])
    .then((results) => {
      user0 = results[0];
      user1 = results[1].user;
      article0 = results[2];
      return util.addArticleAnnotation(article0._id, null, user0);
    })
    .then((annotation) => {
      annotation0 = annotation;
    });
  });

  after(function () {
    passportStub.logout();
    return Promise.all([
      User.collection.drop(),
      Group.collection.drop(),
      Article.collection.drop(),
      Annotation.collection.drop(),
    ]);
  });

  afterEach(function () {
    passportStub.logout();
  });

  // unit tests
  describe('User controller', function () {
    describe('addUserNotification', function () {
      it('should throw an error when type is not recognized', function () {
        return Users.addUserNotification(user1._id, 'badtype', user0._id).should.be.rejected;
      });

      it('should add a reply notification', function () {
        return Promise.all([
          Users.addUserNotification(user1._id, 'reply', user0._id, 'first')
            .then((user) => {
              user.notifications.should.have.lengthOf(1);
              user.notifications[0].messageType.should.equal('reply');
              user.notifications[0].sender.toString().should.equal(user0._id.toString());
              user.notifications[0].createDate.should.be.below(Date.now()).and.above(0);
              user.notifications[0].isRead.should.be.false;
              user.notifications[0].href.should.equal('first');
            }),
          util.checkDatabase((resolve) => {
            resolve(User.findById(user1._id, 'notifications')
            .then((user) => {
              user.notifications.should.have.lengthOf(1);
              user.notifications[0].messageType.should.equal('reply');
              user.notifications[0].sender._id.toString().should.equal(user0._id.toString());
              user.notifications[0].sender.name.should.equal(user0.name);
              user.notifications[0].createDate.should.be.below(Date.now()).and.above(0);
              user.notifications[0].isRead.should.be.false;
              user.notifications[0].href.should.equal('first');
            }));
          }),
        ]);
      });
    });

    describe('getUserNotifications', function () {
      it('should return an empty array when there are no notifications', function () {
        return Users.getUserNotifications(user0._id).should.eventually.be.an('array').with.lengthOf(0);
      });

      it('should return array of notifications and mark them as read', function () {
        return Promise.all([
          Users.getUserNotifications(user1._id).should.eventually.be.an('array').with.lengthOf(1),
          util.checkDatabase((resolve) => {
            resolve(User.findById(user1._id, 'notifications')
            .then((user) => {
              user.notifications.should.have.lengthOf(1);
              user.notifications[0].isRead.should.be.true;
            }));
          }),
        ]);
      });

      it('should paginate notifications properly', function () {
        // add some more notifications
        return Promise.all(new Array(7).fill(0).map(() => Users.addUserNotification(user1._id, 'reply', user0._id)))
        .then((added) => {
          return Users.getUserNotifications(user1._id, 4, 1)
          .then((notifications) => {
            notifications.should.have.lengthOf(4);
            notifications[3].href.should.equal('first');
            notifications[3].isRead.should.be.true;
            for (let i = 0; i < 3; i++) {
              notifications[i].isRead.should.be.false;
            }
            return util.checkDatabase((resolve) => {
              resolve(User.findById(user1._id, 'notifications')
              .then((user) => {
                user.notifications.should.have.lengthOf(8);
                user.notifications[7].href.should.equal('first');
                for (let i = 0; i < 4; i++) {
                  user.notifications[i].isRead.should.be.false;
                }
                for (let i = 4; i < 8; i++) {
                  user.notifications[i].isRead.should.be.true;
                }
              }));
            });
          });
        });
      });

      it('should update user info', function (done) {
        passportStub.login(user1);
        chai.request(app)
        .put('/api/user')
        .send({
          name: 'user one',
          facebookId: '1234',
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.have.property('SUCCESS');
          res.body.SUCCESS.should.have.property('email', 'user1@testuri.com');
          res.body.SUCCESS.should.have.property('name', 'user one');
          res.body.SUCCESS.should.have.property('googleId', 'user1_id');
          user1.name = res.body.SUCCESS.name;
          done();
        });
      });
    });
  });

  describe('GET /api/user/numUnreadNotifications', function () {
    it('should get the right number of unread notifications', (done) => {
      passportStub.login(user1);
      chai.request(app)
        .get('/api/user/numUnreadNotifications')
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.equal(4);
          done();
        });
    });
  });

  describe('Annotation reply notification hook', function () {
    it('should not add notification when user replies to self', function () {
      passportStub.login(user0);
      chai.request(app)
        .post('/api/annotation')
        .send({
          text: 'Some reply',
          parent: annotation0._id,
          uri: article0.uri,
        })
        .end();
      return util.checkDatabase((resolve) => {
        resolve(Users.getUserNotifications(user0._id).should.eventually.be.an('array').with.lengthOf(0));
      });
    });

    it('should add an unread notification when another user replies', function () {
      passportStub.login(user1);
      chai.request(app)
        .post('/api/annotation')
        .send({
          text: 'Another reply',
          parent: annotation0._id,
          uri: article0.uri,
        })
        .end();
      return util.checkDatabase((resolve) => {
        resolve(Users.getUserNotifications(user0._id)
        .then((notifs) => {
          notifs.should.have.lengthOf(1);
          notifs[0].messageType.should.equal('reply');
          notifs[0].sender._id.toString().should.equal(user1._id.toString());
          notifs[0].sender.name.should.equal(user1.name);
          notifs[0].createDate.should.be.below(Date.now());
          notifs[0].isRead.should.be.false;
          notifs[0].href.should.equal(`${config.frontEndHost}/discussion/${article0._id}`);
        }));
      });
    });
  });

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
          res.body.should.have.property('email', 'user0@testuri.com');
          res.body.should.have.property('name', 'user0');
          res.body.should.have.property('googleId', 'user0_id');
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
          res.body.should.have.property('email', user1.email);
          res.body.should.have.property('name', user1.name);
          res.body.should.have.property('googleId', user1.googleId);

          res.body.should.have.property('groups').with.lengthOf(2);
          res.body.groups[0]._id.toString().should.not.equal(res.body.groups[1]._id.toString());
          for (let i = 0; i < 2; i++) {
            const group = res.body.groups[i];
            group.name.should.match(/Group [1-2]/);
            group.description.should.equal(`Description of ${group.name}`);
            group.creator.toString().should.equal(user1.id);
          }
          done();
        });
    });
  });
});
