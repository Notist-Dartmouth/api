process.env.NODE_ENV = 'test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import passportStub from 'passport-stub';
import { app } from '../server/app';

import Article from '../server/models/article';
import Annotation from '../server/models/annotation';
import Group from '../server/models/group';
import User from '../server/models/user';

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
    GroupA = new Group({
      name: 'GroupA',
      description: 'Description A',
    });
    const ArticleA = new Article({
      uri: 'www.nytimes.com/articleA',
    });
    GroupA.save(function (err) {
      ArticleA.group = GroupA.id;
      ArticleA.save(function (err) {
        done();
      });
    });
    const userParams = { username: 'cblanc', googleId: '12345678', groupIds: [GroupA.id] };
    user = new User(userParams);
    user.save();
  });
  after(function (done) {
    // Group.collection.drop();
    // Article.collection.drop();
    // Annotation.collection.drop();
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
      passportStub.login(user);
      chai.request(app)
      .post('/api/annotation')
      .send({
        'uri': 'www.nytimes/com/articleB',
        'articleText': 'This is a New Article',
        'isPublic': true,
      })
      .end(function (err, res) {
        console.log(res);
        res.should.have.status(200);
        res.body.should.have.property('SUCCESS');
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
