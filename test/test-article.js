// command: mocha --require babel-register
process.env.NODE_ENV = 'test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../server/app';
import Article from '../server/models/article';
// import Annotation from '../server/models/annotation';
import Group from '../server/models/group';

chai.should();
chai.use(chaiHttp);
// eslint comment:
/* global describe it beforeEach afterEach:true */

describe('Articles', () => {
  beforeEach(done => {
    done();
  });

  afterEach(done => {
    Article.collection.drop();
    Group.collection.drop();
    done();
  });

  it('should add a single article with no groups on /api/articles POST', done => {
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
