// command: mocha --require babel-register
process.env.NODE_ENV = 'test';

// import chai from
const chai = require('chai');
const chaiHttp = require('chai-http');
// const mongoose = require('mongoose');
// const server = require('../_config/app');

import { app } from '../server/app';
import Article from '../server/models/article';
import Annotation from '../server/models/annotation';
import Group from '../server/models/group';

var should = chai.should();
chai.use(chaiHttp);

describe('Groups', function () {
  /* Group.collection.drop();*/

  beforeEach(function (done) {
    var newGroup = new Group({
      name: 'test group name',
      description: 'test group description',
      creator: '123412341234123412341234',
      articles: ['111111111111111111111111', '222222222222222222222222'],
      members: ['123412341234123412341234', '234523452345234523452345'],
    });
    newGroup.save(function (err) {
      done();
    });
  });

  afterEach(function (done) {
    Group.collection.drop();
    done();
  });

  it('see how this works', function (done) {
    done();
  });

  it('should create a group on /api/group POST', function (done) {
    chai.request(app)
      .post('/api/group')
      .send({
        'name': 'test group 2 name',
        'description': 'test group 2 description',
        'creator': '346534563456345634563465',
      })
      .end(function (err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.should.be.a('object');
        res.body.SUCCESS.should.have.property('_id');
        res.body.SUCCESS.should.have.property('name');
        res.body.SUCCESS.should.have.property('description');
        res.body.SUCCESS.should.have.property('createDate');
        res.body.SUCCESS.should.have.property('editDate');
        res.body.SUCCESS.should.have.property('articles');
        res.body.SUCCESS.name.should.equal('test group 2 name');
        res.body.SUCCESS.description.should.equal('test group 2 description');
        res.body.SUCCESS.creator.should.equal('346534563456345634563465');
        res.body.SUCCESS.articles.should.equal([]);
        res.body.SUCCESS.members.should.equal(['346534563456345634563465']);
        done();
      })
    done();
  });

  // TODO: need to figure out how to get the group ID
  it('should get a specific group on /api/group/:id GET');
  it('should add a single member to specified group');


});


/* annotations */
/* groups */
