// command: mocha --require babel-register
process.env.NODE_ENV = 'test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../server/app';
import Article from '../server/models/article';
// import Annotation from '../server/models/annotation';
// import Group from '../server/models/group';

const should = chai.should();
chai.use(chaiHttp);

describe('Articles', function () {
  /* Article.collection.drop();*/

  // beforeEach(function (done) {
  //   var newGroup;
  //   var newArticle = new Article({
  //     uri: 'www.thisisauri.com',
  //     groups: ['123412341234123412341234'],
  //   });
  //   newArticle.save(function (err) {
  //     done();
  //   });
  // });
  // afterEach(function (done) {
  // /*  Article.collection.drop();*/
  //   done();
  // });

  it('should add a single article on /api/articles POST', function (done) {
    const testURI = 'www.nytimes.com';
    chai.request(app)
      .post('/api/article')
      .send({ uri: testURI, groupIds: [] })
      .end(function (err, res) {
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
        done(); // TODO: Add more here
      });
  });
});
