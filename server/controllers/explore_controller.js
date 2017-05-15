import Article from '../models/article';
import * as Articles from '../controllers/article_controller';

import FB from 'fb';
import _ from 'underscore';

export const postExploreArticles = (ids, score) => {
  const regex = /((http|https):\/\/)?(www[.])?facebook.com\/.+/g;
  var promises = [];

  // TODO: get APP access token or user access token?!
  FB.setAccessToken('EAACEdEose0cBACKm5rN7a3oz161sdM45R1HGIFr88yhr7QRshlkTZAIYwTZAZBgmOwVRaSeC16GhpWQ2EAnsZAO7GQ2ls4eHAZANWOS3Ybwg0NerI1Gf4vAej9Qkuu691zmxtZCezECoAlPRQj8iA4xi01licAHTyA8gieenBfI7s3TYE0ZAcSkkkRUG55MtHcZD');
  _.each(ids, (id) => {
    FB.api(
      id, // '/146422995398181'
      'GET',
      { fields: 'posts.limit(10){link}' },
      (response) => {
        if (response.posts) {
          const data = response.posts.data;
          _.each(data, (link_obj) => { // for each link in links
            // save article to notist API with userScore as explore_num +- std_dev
            const link = link_obj.link;
            if (link && !link.match(regex)) {
              console.log(link);
              var promise = new Promise(function (resolve, reject) {
                return Articles.createArticle(link, [], score);
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
