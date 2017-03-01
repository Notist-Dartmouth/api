process.env.NODE_ENV = 'test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import passportStub from 'passport-stub';
import { app } from '../server/app';

import Article from '../server/models/article';
import Annotation from '../server/models/annotation';
import Group from '../server/models/group';
import User from '../server/models/user';

import util from './util';

var should = chai.should();

chai.use(chaiHttp);
passportStub.install(app);

// app.request.isAuthenticated = function () {
//   return true;
// };

describe('Annotations', function () {
  let GroupA;
  let ArticleA;
  let user;
  before(function (done) {
    const created = util.addUserWithGroup('user', 'GroupA');
    GroupA = created.group;
    user = created.user;
    ArticleA = util.addArticleInGroup(GroupA._id, 'www.nytimes.com/articleA');
    done();
  });
  after(function (done) {
    // Group.collection.drop();
    // Article.collection.drop();
    // Annotation.collection.drop();
    passportStub.logout();
    done();
  });

  describe('FirstAnnotation', function () {
    it('should return 401 error for unathenticated user', function (done) {
      chai.request(app)
      .post('/api/annotation')
      .send({
        'uri': 'hello.com',
      })
      .end(function (err, res) {
        res.should.have.status(401);
        done();
      });
    });

    it('should add annotation to new article in general group', function (done) {
      const uri = 'www.nytimes.com/articleB';
      const articleText = 'This is a new article';
      const text = 'This is my annotation';
      const isPublic = true;
      passportStub.login(user);
      chai.request(app)
      .post('/api/annotation')
      .send({
        uri,
        'groupIds': [],
        articleText,
        text,
        isPublic,
      })
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.articleText.should.equal(articleText);
        res.body.SUCCESS.text.should.equal(text);
        res.body.SUCCESS.isPublic.should.be.true;
        done();
      });
    });

    it('should add annotation to new article in a public group');
    it('should add annotation to already existing article');
    it('should add annotation to private and public group');
    it('should return all annotations on particular article');
  });

  describe('AnnotationReplies', function () {
    it('should post reply annotatin the general group');
    it('should post reply annotatin a public group');
    it('should post reply annotation in private group');
    it('should list all replies on annotation in public group');
    it('should list all replies on annotation in private group');
  });
});


/* annotations */
/* groups */
