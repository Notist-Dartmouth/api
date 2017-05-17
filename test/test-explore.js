import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import passportStub from 'passport-stub';
import { app } from '../server/app';
import util from './util';
import * as Explore from '../server/controllers/explore_controller';
import Annotation from '../server/models/annotation';
import Article from '../server/models/article';
import User from '../server/models/user';

const should = chai.should();
chai.use(chaiHttp);
chai.use(chaiAsPromised);
passportStub.install(app);
// eslint comment:
/* global describe it before after afterEach:true */

describe('Explore', function () {
  describe('populate feed', function () {
    let knownArticle;
    let bubbleArticle;
    let extremeArticle;
    let lowerRangeArticle;
    let higherRangeArticle;
    let user;

    before(function () {
      return Promise.all([
        util.addNArticles(5),
        util.addUser(),
      ])
      .then(([newArticles, newUser]) => {
        [knownArticle, bubbleArticle, extremeArticle, lowerRangeArticle, higherRangeArticle] = newArticles;
        user = newUser;

        return util.addArticleAnnotation(knownArticle.id, null, user);
      })
      .then((newAnnotation) => {
        // make changes
        const mean = 5;
        const std = 2;
        const MIN_USER_DISTANCE = std * Explore.MIN_DISTANCE;
        const MAX_USER_DISTANCE = std * Explore.MAX_DISTANCE;
        const MEAN_USER_DISTANCE = (MIN_USER_DISTANCE + MAX_USER_DISTANCE) / 2;
        user.exploreNumber = mean;
        user.exploreStandardDev = std;
        knownArticle.avgUserScore = mean - MEAN_USER_DISTANCE; // would otherwise be selected
        bubbleArticle.avgUserScore = mean + MIN_USER_DISTANCE / 2;
        extremeArticle.avgUserScore = mean - MAX_USER_DISTANCE * 1.5;
        lowerRangeArticle.avgUserScore = mean - MEAN_USER_DISTANCE;
        higherRangeArticle.avgUserScore = mean + MEAN_USER_DISTANCE;

        return Promise.all([
          user.save(),
          knownArticle.save(),
          bubbleArticle.save(),
          extremeArticle.save(),
          lowerRangeArticle.save(),
          higherRangeArticle.save(),
        ]);
      });
    });

    after(function (done) {
      passportStub.logout();
      setTimeout(() => {
        Promise.all([
          Article.collection.drop(),
          Annotation.collection.drop(),
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

    it('should return only the right articles in the explore feed', function (done) {
      passportStub.login(user);
      chai.request(app)
      .get('/api/explore')
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.should.have.lengthOf(2);
        const ids = res.body.map((an) => { return an._id.toString(); });
        ids.should.include(lowerRangeArticle.id);
        ids.should.include(higherRangeArticle.id);
        ids[0].should.be.above(ids[1]);
        done();
      });
    });
  });
});
