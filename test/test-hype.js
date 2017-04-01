app.settings.env = 'test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import passportStub from 'passport-stub';
import { app } from '../server/app';

import Annotation from '../server/models/annotation';
import User from '../server/models/user';
import Group from '../server/models/group';
import Article from '../server/models/article';

import util from './util';

const should = chai.should();
chai.use(chaiHttp);
chai.use(chaiAsPromised);
passportStub.install(app);
// eslint comment:
/* global describe it before after:true */

describe('Hype', function () {
  let group0 = null;
  let user = null;
  let article = null;
  let annotation1 = null;
  let annotation2 = null;
  let annotation3 = null;

  before(function () {
    return util.addUserWithGroup()
    .then(created => {
      group0 = created.group;
      user = created.user;
      return util.addArticleInGroup(group0._id, 'www.testuri.com');
    })
    .then(art => {
      article = art;
      annotation1 = new Annotation({
        articleId: article._id,
        groupId: group0._id,
        articleText: 'Article makes an interesting point.',
        text: 'Annotation A',
        isPublic: true,
        isTopLevel: true,
        parent: null,
      });
      annotation1.save()
      .then(anno1 => {
        console.log('in util: anno1');
        console.log(anno1);
        annotation2 = new Annotation({
          articleId: article._id,
          groupId: group0._id,
          articleText: 'Article makes an interesting point.',
          text: 'Annotation B',
          isPublic: true,
          isTopLevel: true,
          parent: annotation1._id,
        });
        return annotation2.save();
      })
      .then(anno2 => {
        console.log('in util: anno2');
        console.log(anno2);
        annotation3 = new Annotation({
          articleId: article._id,
          groupId: group0._id,
          articleText: 'Article makes an interesting point.',
          text: 'Annotation C',
          isPublic: true,
          isTopLevel: true,
          parent: annotation1._id,
        });
        return annotation3.save();
      })
      .then(anno3 => {
        console.log('in util: anno3');
        console.log(anno3);
      })
      .catch(err => {
        console.log(err);
      });
    });
  });

  after(function (done) {
    passportStub.logout();
    setTimeout(() => {
      Promise.all([
        Annotation.collection.drop(),
        Article.collection.drop(),
        Group.collection.drop(),
        User.collection.drop(),
      ]).then(res => {
        done();
      })
      .catch(err => {
        done(err);
      });
    }, 1000);
  });

  describe('getArticleAnnotations', function () {
    it('should come back with a chain of things, please for the love of god', function () {
      passportStub.login(user);
      chai.request(app)
        .get(`/api/article/annotations?uri=${article.uri}`)
        .end(function (err, res) {
          console.log('in the actual unit test');
          console.log(res.body);
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body[0].should.have.property('articleText');
          res.body[0].should.have.property('text');
        });
    });
    it('should come back with a tree of annotations');
  });
});
