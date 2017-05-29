import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import passportStub from 'passport-stub';
import { app } from '../server/app';

import Article from '../server/models/article';
// import Annotation from '../server/models/annotation';
import Group from '../server/models/group';
import User from '../server/models/user';

import * as Groups from '../server/controllers/group_controller';

import util from './util';

chai.should();
chai.use(chaiHttp);
chai.use(chaiAsPromised);
passportStub.install(app);

// eslint comment:
/* global describe it before after afterEach:true */

describe('Groups', function () {
  let newGroup;
  let newUser;
  let user2;
  let article1;
  let article2;
  const fakeObjectId = '123412341234123412341234';

  before(function () {
    return util.addUserWithGroup('user1')
    .then((created) => {
      newGroup = created.group;
      newUser = created.user;
      return util.addUser('user2');
    })
    .then((user) => {
      user2 = user;
      return Promise.all([
        util.addArticleInGroup(newGroup._id, 'www.article1.com'),
        util.addArticleInGroup(newGroup._id, 'www.article2.com'),
      ]);
    })
    .then((articles) => {
      article1 = articles[0];
      article2 = articles[1];
      const update = { $push: {
        articles: { $each: [article1._id, article2._id] },
        members: user2._id,
      } };
      return Group.findByIdAndUpdate(newGroup._id, update);
    });
  });


  after(function (done) {
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

  afterEach(function (done) {
    passportStub.logout();
    done();
  });

  // unit tests
  describe('Group controller', function () {
    describe('createGroup', function () {});

    describe('addGroupMember', function () {});

    describe('addGroupArticle', function () {});

    describe('getGroup', function () {});

    describe('getGroupsFiltered', function () {
      it('should reject on invalid input', function () {
        return Promise.all([
          Groups.getGroupsFiltered().should.eventually.be.rejected,
          Groups.getGroupsFiltered('notAnObject').should.eventually.be.rejected,
        ]);
      });

      it('should resolve to empty array when no groups match conditions', function () {
        return Groups.getGroupsFiltered({ name: 'Not the group name' }).should.eventually.be.empty;
      });

      it('should resolve to list of article objects that match conditions', function () {
        return Groups.getGroupsFiltered({ members: newUser._id })
        .then((result) => {
          result.should.have.lengthOf(1);
          result[0].name.should.equal('Group');
          result[0].id.should.equal(newGroup.id);
        });
      });
    });

    describe('getGroupMembers', function () {
      it('should reject on invalid input', function () {
        return Promise.all([
          Groups.getGroupMembers().should.eventually.be.rejected,
          Groups.getGroupMembers(123).should.eventually.be.rejected,
          Groups.getGroupMembers('notObjectId').should.eventually.be.rejected,
          Groups.getGroupMembers(fakeObjectId).should.eventually.be.rejected,
        ]);
      });

      it('should resolve to array of members', function () {
        return Groups.getGroupMembers(newGroup.id)
        .then((members) => {
          members.should.have.lengthOf(2);
          for (let i = 0; i < 2; i++) {
            members[i].should.have.property('name').match(/user/);
            members[i].should.have.property('email');
          }
          members[0].id.should.not.equal(members[1].id);
        });
      });
    });

    describe('getGroupArticles', function () {
      it('should reject on invalid input', function () {
        return Promise.all([
          Groups.getGroupArticles().should.eventually.be.rejected,
          Groups.getGroupArticles(123).should.eventually.be.rejected,
          Groups.getGroupArticles('notObjectId').should.eventually.be.rejected,
          Groups.getGroupArticles(fakeObjectId).should.eventually.be.rejected,
        ]);
      });

      it('should resolve to array of articles in group', function () {
        return Groups.getGroupArticles(newGroup.id)
        .then((articles) => {
          articles.should.have.lengthOf(2);
          for (let i = 0; i < 2; i++) {
            articles[i].should.have.property('uri').match(/article.\.com/);
            articles[i].should.have.deep.property('info.title').match(/Article at/);
            articles[i].should.have.property('groups').include(newGroup.id);
          }
          articles[0].id.should.not.equal(articles[1].id);
        });
      });
    });

    describe('getGroupArticlesPaginated', function () {
      it('should resolve to paginated array of articles in group sorted by most recent', function () {
        return Promise.all([
          util.addArticleInGroup(newGroup._id, 'www.article3.com'),
          util.addArticleInGroup(newGroup._id, 'www.article4.com'),
        ]).then((newArticles) => {
          const conditions = {};

          conditions.query = { groups: newGroup.id };
          conditions.pagination = { skip: 1, limit: 2 };
          conditions.sort = { editDate: -1 };

          return Groups.getGroupArticlesPaginated(newGroup.id, conditions)
            .then((articles) => {
              articles.should.have.lengthOf(2);
              articles[0].should.have.property('uri').match(/article.\.com/);
            });
        });
      });

      it('should resolve to paginated array of articles sorted by ', function (done) {
        done();
      });
    });
  });

  const group2Name = 'test group 2 name';
  let group2Id;
  describe('API calls', function () {
    it('should create a public group on /api/group POST', function () {
      passportStub.login(newUser);
      const groupDescription = 'test group 2 description';
      chai.request(app)
        .post('/api/group')
        .send({
          name: group2Name,
          description: groupDescription,
          isPublic: true,
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property('SUCCESS');
          res.body.SUCCESS.should.be.an('object');
          res.body.SUCCESS.should.have.property('_id');
          group2Id = res.body.SUCCESS._id;
          res.body.SUCCESS.should.have.property('name', group2Name);
          res.body.SUCCESS.should.have.property('description', groupDescription);
          res.body.SUCCESS.should.have.property('creator', newUser._id.toString());
          res.body.SUCCESS.should.have.property('createDate');
          res.body.SUCCESS.should.have.property('editDate');
          res.body.SUCCESS.should.have.property('articles').that.is.empty;
          res.body.SUCCESS.should.have.property('members').with.members([newUser._id.toString()]);
          res.body.SUCCESS.should.have.property('isPublic', true);
          res.body.SUCCESS.should.have.property('isPersonal', false);
        });

      // update newUser
      return util.checkDatabase((resolve) => {
        resolve(User.findById(newUser._id)
        .then((user) => {
          newUser = user;
        }));
      });
    });

    it('should get a list of public groups on /api/public/groups GET', (done) => {
      chai.request(app)
      .get('/api/public/groups')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.should.have.a.lengthOf(1);
        res.body[0].name.should.equal(group2Name);
        res.body[0].creator.name.should.equal(newUser.name);
        res.body[0].creator._id.toString().should.equal(newUser.id);
        done();
      });
    });

    it('should get a specific group on /api/group/:id GET', function (done) {
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

    it('should add a single member to specified group on /api/group/:groupId/user POST', function (done) {
      passportStub.login(newUser);
      chai.request(app)
        .post(`/api/group/${group2Id}/user?userId=${user2.id}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property('SUCCESS');
          res.body.SUCCESS.should.have.property('_id');
          res.body.SUCCESS._id.toString().should.equal(group2Id.toString());
          res.body.SUCCESS.should.have.property('name');
          res.body.SUCCESS.should.have.property('description');
          res.body.SUCCESS.should.have.property('creator', newUser.id);
          res.body.SUCCESS.should.have.property('createDate');
          res.body.SUCCESS.should.have.property('editDate');
          res.body.SUCCESS.should.have.property('articles');
          res.body.SUCCESS.articles.should.have.lengthOf(0);
          res.body.SUCCESS.should.have.property('members');
          res.body.SUCCESS.members.should.have.members([newUser.id, user2.id]);
          res.body.SUCCESS.should.have.property('isPublic', true);
          res.body.SUCCESS.should.have.property('isPersonal', false);
          done();
        });
    });

    it('should remove self from specified group on /api/group/:groupId/user POST', function () {
      passportStub.login(newUser);
      chai.request(app)
      .post(`/api/group/${group2Id}/user`)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.should.have.property('_id');
        res.body.SUCCESS._id.toString().should.equal(group2Id.toString());
        res.body.SUCCESS.should.have.property('members');
        res.body.SUCCESS.members.should.have.members([user2.id]);
      });

      return util.checkDatabase((resolve) => {
        resolve(Group.findById(group2Id).should.eventually.have.property('members').with.lengthOf(1));
      });
    });

    it('should get two articles of group', function (done) {
      passportStub.login(newUser);
      chai.request(app)
      .get(`/api/group/${newGroup._id}/articles/paginated?page=1&limit=2`)
      .end((err, res) => {
        res.body.should.be.an('array');
        res.body.should.have.length('2');
        res.body[0].should.have.property('uri');
        res.body[0].should.have.property('info');
        done();
      });
    });
  });
});
