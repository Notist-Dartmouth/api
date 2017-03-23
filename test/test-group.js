app.settings.env = 'test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import passportStub from 'passport-stub';
import { app } from '../server/app';

import Article from '../server/models/article';
// import Annotation from '../server/models/annotation';
import Group from '../server/models/group';
import User from '../server/models/user';

import util from './util';

chai.should();
chai.use(chaiHttp);
passportStub.install(app);

// eslint comment:
/* global describe it before after afterEach:true */

describe('Groups', () => {
  let newGroup;
  let newUser;
  let user2;
  let article1;
  let article2;

  before(() => {
    return util.addUserWithGroup('user1')
    .then(created => {
      newGroup = created.group;
      newUser = created.user;
      return util.addUser('user2');
    })
    .then(user => {
      user2 = user;
      return Promise.all([
        util.addArticleInGroup(newGroup._id, 'www.article1.com'),
        util.addArticleInGroup(newGroup._id, 'www.article2.com'),
      ]);
    })
    .then(articles => {
      article1 = articles[0];
      article2 = articles[1];
      const update = { $push: {
        articles: { $each: [article1._id, article2._id] },
        members: user2._id,
      } };
      return Group.findByIdAndUpdate(newGroup._id, update);
    });
  });

  after(done => {
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

  afterEach((done) => {
    passportStub.logout();
    done();
  });

  it('should create a group on /api/group POST', function (done) {
    passportStub.login(newUser);
    const groupName = 'test group 2 name';
    const groupDescription = 'test group 2 description';
    chai.request(app)
      .post('/api/group')
      .send({
        name: groupName,
        description: groupDescription,
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.should.be.an('object');
        res.body.SUCCESS.should.have.property('_id');
        res.body.SUCCESS.should.have.property('name', groupName);
        res.body.SUCCESS.should.have.property('description', groupDescription);
        res.body.SUCCESS.should.have.property('creator', newUser._id.toString());
        res.body.SUCCESS.should.have.property('createDate');
        res.body.SUCCESS.should.have.property('editDate');
        res.body.SUCCESS.should.have.property('articles').that.is.empty;
        res.body.SUCCESS.should.have.property('members').with.members([newUser._id.toString()]);
        res.body.SUCCESS.should.have.property('isPublic', false);
        res.body.SUCCESS.should.have.property('isPersonal', false);
        done();
      });
  });

  it('should get a specific group on /api/group/:id GET', done => {
    passportStub.login(newUser);
    chai.request(app)
      .get(`/api/group/${newGroup._id}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.should.have.property('body');
        res.body.should.have.property('_id', newGroup._id.toString());
        res.body.should.have.property('name', newGroup.name);
        res.body.should.have.property('description', newGroup.description);
        res.body.should.have.property('creator', newUser._id.toString());
        res.body.should.have.property('createDate');
        res.body.should.have.property('editDate');
        res.body.should.have.property('articles');
        res.body.articles.should.have.members([article1._id.toString(), article2._id.toString()]);
        res.body.members.should.have.members([newUser._id.toString(), user2._id.toString()]);
        res.body.should.have.property('members');
        res.body.should.have.property('isPublic', false);
        res.body.should.have.property('isPersonal', false);
        done();
      });
  });

  it('should add a single member to specified group on /api/group/:groupId/user/:userId POST', done => {
    passportStub.login(newUser);
    const addedUserId = '345634563456345634563456';
    chai.request(app)
      .post(`/api/group/${newGroup._id}/user/${addedUserId}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.should.have.property('_id', newGroup._id.toString());
        res.body.SUCCESS.should.have.property('name', newGroup.name);
        res.body.SUCCESS.should.have.property('description', newGroup.description);
        res.body.SUCCESS.should.have.property('creator', newUser._id.toString());
        res.body.SUCCESS.should.have.property('createDate');
        res.body.SUCCESS.should.have.property('editDate');
        res.body.SUCCESS.should.have.property('articles');
        res.body.SUCCESS.articles.should.have.members([article1._id.toString(), article2._id.toString()]);
        res.body.SUCCESS.should.have.property('members');
        res.body.SUCCESS.members.should.have.members([newUser._id.toString(), user2._id.toString(), addedUserId]);
        res.body.SUCCESS.should.have.property('isPublic', false);
        res.body.SUCCESS.should.have.property('isPersonal', false);
        done();
      });
  });
});
