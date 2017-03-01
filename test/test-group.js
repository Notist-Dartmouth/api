// command: mocha --require babel-register
process.env.NODE_ENV = 'test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import passportStub from 'passport-stub';
import { app } from '../server/app';

import Group from '../server/models/group';

import util from './util';

chai.should();
chai.use(chaiHttp);
passportStub.install(app);

// eslint comment:
/* global describe it beforeEach afterEach:true */


describe('Groups', () => {
  let newGroup;
  let user;
  beforeEach(done => {
    user = util.addUser('user');
    newGroup = new Group({
      name: 'test group name',
      description: 'test group description',
      creator: '123412341234123412341234',
      articles: ['111111111111111111111111', '222222222222222222222222'],
      members: ['123412341234123412341234', '234523452345234523452345'],
    });
    newGroup.save()
    .then(result => {
      done();
    });
  });

  afterEach(done => {
    Group.collection.drop();
    passportStub.logout();
    done();
  });

  it('should create a group on /api/group POST', done => {
    passportStub.login(user);
    chai.request(app)
      .post('/api/group')
      .send({
        name: 'test group 2 name',
        description: 'test group 2 description',
        creator: '345634563456345634563456',
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.should.be.a('object');
        res.body.SUCCESS.should.have.property('_id');
        res.body.SUCCESS.should.have.property('name');
        res.body.SUCCESS.should.have.property('description');
        res.body.SUCCESS.should.have.property('creator');
        res.body.SUCCESS.should.have.property('createDate');
        res.body.SUCCESS.should.have.property('editDate');
        res.body.SUCCESS.should.have.property('articles');
        res.body.SUCCESS.should.have.property('members');
        res.body.SUCCESS.name.should.equal('test group 2 name');
        res.body.SUCCESS.description.should.equal('test group 2 description');
        res.body.SUCCESS.creator.should.equal('345634563456345634563456');
        res.body.SUCCESS.articles.should.eql([]);
        res.body.SUCCESS.members.should.eql(['345634563456345634563456']);
        done();
      });
  });

  it('should get a specific group on /api/group/:id GET', done => {
    passportStub.login(user);
    chai.request(app)
      .get(`/api/group/${newGroup._id}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.should.have.property('_id');
        res.body.SUCCESS.should.have.property('name');
        res.body.SUCCESS.should.have.property('description');
        res.body.SUCCESS.should.have.property('creator');
        res.body.SUCCESS.should.have.property('createDate');
        res.body.SUCCESS.should.have.property('editDate');
        res.body.SUCCESS.should.have.property('articles');
        res.body.SUCCESS.should.have.property('members');
        res.body.SUCCESS._id.should.equal(String(newGroup._id));
        res.body.SUCCESS.name.should.equal('test group name');
        res.body.SUCCESS.description.should.equal('test group description');
        res.body.SUCCESS.creator.should.equal('123412341234123412341234');
        res.body.SUCCESS.articles.should.eql(['111111111111111111111111', '222222222222222222222222']);
        res.body.SUCCESS.members.should.eql(['123412341234123412341234', '234523452345234523452345']);
        done();
      });
  });

  it('should add a single member to specified group on /api/group/:groupId/user/:userId POST', done => {
    chai.request(app)
      .post(`/api/group/${newGroup._id}/user/345634563456345634563456`)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.should.have.property('_id');
        res.body.SUCCESS.should.have.property('name');
        res.body.SUCCESS.should.have.property('description');
        res.body.SUCCESS.should.have.property('creator');
        res.body.SUCCESS.should.have.property('createDate');
        res.body.SUCCESS.should.have.property('editDate');
        res.body.SUCCESS.should.have.property('articles');
        res.body.SUCCESS.should.have.property('members');
        res.body.SUCCESS._id.should.equal(String(newGroup._id));
        res.body.SUCCESS.name.should.equal('test group name');
        res.body.SUCCESS.description.should.equal('test group description');
        res.body.SUCCESS.creator.should.equal('123412341234123412341234');
        res.body.SUCCESS.articles.should.eql(['111111111111111111111111', '222222222222222222222222']);
        res.body.SUCCESS.members.should.eql(['123412341234123412341234', '234523452345234523452345', '345634563456345634563456']);
        done();
      });
  });

  it('should get users of a group');
  it('should get articles of a group');
  it('should get public groups (communities) search based on title/description');
});
