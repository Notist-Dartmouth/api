process.env.NODE_ENV = 'test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../server/app';

import Article from '../server/models/article';
import Annotation from '../server/models/annotation';
import Group from '../server/models/group';

var should = chai.should();
chai.use(chaiHttp);

app.request.isAuthenticated = function () {
  return true;
};

describe('Annotations', function () {
  let GroupA;
  let ArticleA;
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
  });
  after(function (done) {
    // Group.collection.drop();
    // Article.collection.drop();
    // Annotation.collection.drop();
    done();
  });

  describe('FirstAnnotation', function () {
    it('should add annotation to new article in general group', function (done) {
      chai.request(app)
      .post('/api/annotation')
      .send({
        'uri': 'www.nytimes/com/articleB',
        'groupIds': GroupA.id,
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
