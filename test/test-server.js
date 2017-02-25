// command: mocha --require babel-register
process.env.NODE_ENV = 'test';

// import chai from
const chai = require('chai');
const chaiHttp = require('chai-http');
// const mongoose = require('mongoose');
// const server = require('../_config/app');

import { app, mongoose } from '../server/_config';
import Article from '../server/models/article';
import Annotation from '../server/models/annotation';
import Group from '../server/models/group';

var should = chai.should();
chai.use(chaiHttp);

describe('Articles', function () {
  /* Article.collection.drop();*/

  beforeEach(function (done) {
    var newGroup;
    var newArticle = new Article({
      uri: 'www.thisisauri.com',
      group: '1234',
    });
    newArticle.save(function (err) {
      done();
    });
  });
  afterEach(function (done) {
  /*  Article.collection.drop();*/
    done();
  });

  it('should list ALL articles on /api/articles GET', function (done) {
    chai.request(app)
      .get('/api/article')
      .end(function (err, res) {
        res.should.have.status(200);
        res.should.be.json;
        done(); // TODO: ADD MORE HERE
      });
  });
  it('should add a single article on /api/articles POST', function (done) {
    chai.request(app)
      .post('/api/article')
      .send({ 'uri': 'www.nytimes.com' })
      .end(function (err, res) {
        res.should.have.status(200);
        res.should.be.json;
        done(); // TODO: Add more here
      });
  });
});


/* annotations */
/* groups */
