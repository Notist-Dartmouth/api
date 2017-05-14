import Article from '../models/article';


import FB from 'fb';
import _ from 'underscore';

export const postExploreArticles = (ids) => {
  // TODO: where / when / how do we get facebook token?
  console.log(ids);

  // for each page ID, make call below
  _.each(ids, (id) => {
    FB.api(
    id, // '/146422995398181'
    'GET',
    { fields: 'posts.limit(5){link}' },
    (response) => {
      console.log(response);
      const links = response.posts.data;
        // for each link in links
        // save article to notist API with userScore as explore_num +- std_dev
    },
  );
  });
};
