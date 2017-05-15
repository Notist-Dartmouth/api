import Article from '../models/article';
import * as Articles from '../controllers/article_controller';

import FB from 'fb';
import _ from 'underscore';

/*
* These constants define the range of the avgUserScores of articles the user should
* see in explore, in units of their exploreStandardDev from their exploreNumber.
* An article is included if its avgUserScore is in the following range:
* [exploreNumber-exploreStdDev*EXPLORE_MAX_DISTANCE exploreNumber-exploreStdDev*EXPLORE_MIN_DISTANCE] U
* [exploreNumber+exploreStdDev*EXPLORE_MIN_DISTANCE exploreNumber+exploreStdDev*EXPLORE_MAX_DISTANCE]
*/
export const MIN_DISTANCE = 1.3;
export const MAX_DISTANCE = 1.8;

export const postExploreArticles = (ids, score) => {
  const regex = /((http|https):\/\/)?(www[.])?facebook.com\/.+/g;
  const appAccessToken = process.env.FACEBOOK_APP_ID + '|' + process.env.FACEBOOK_APP_SECRET;
  const promises = [];

  _.each(ids, (id) => {
    FB.api(
      id,
      'GET',
      { access_token: appAccessToken,
        fields: 'posts.limit(10){link}' },
      (response) => {
        if (response.posts) {
          const data = response.posts.data;
          _.each(data, (link_obj) => { // for each link in links
            // save article to notist API with userScore as explore_num +- std_dev
            const link = link_obj.link;
            if (link && !link.match(regex)) {
              console.log('added/updated in db', link);
              const promise = new Promise(function (resolve, reject) {
                Articles.getArticle(link)
                .then((article) => {
                  if (article == null) {
                    return Articles.createArticle(link, [], score);
                  } else {
                    return Articles.updateArticleScore(article.id, score);
                  }
                });
              });
              promises.push(promise);
            }
          });
        }
      },
    );
  });

  return Promise.all(promises);
};

/*
Function to get called when populating the explore feed view
*/
export const populateExploreFeed = (user, conditions) => {
  // show most recent articles first
  conditions.sort = { _id: -1 };

  // target avgUserScores
  const mean = user.exploreNumber;
  const std = user.exploreStandardDev;
  const lowerMin = mean - MAX_DISTANCE * std;
  const lowerMax = mean - MIN_DISTANCE * std;
  const upperMin = mean + MIN_DISTANCE * std;
  const upperMax = mean + MAX_DISTANCE * std;

  return user.articles.then((knownArticles) => {
    const filter = {
      _id: { $nin: knownArticles },
      $or: [
        { avgUserScore: { $gt: lowerMin, $lt: lowerMax } },
        { avgUserScore: { $gt: upperMin, $lt: upperMax } },
      ],
    };
    return Articles.getArticlesFiltered(filter, conditions);
  });
};
