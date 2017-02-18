import Article from '../models/article';
import Group from '../models/group';

// Should only be called when creating annotations
export const createArticle = (uri, groupIds) => {
  const article = new Article();
  article.uri = uri;
  article.groups.push(groupIds);
  return article.save()
  .then(result => {
    Group.addGroupArticle(groupIds, result._id);
  });
};

export const getArticle = (articleId) => {
  Article.find({}, (err, articles) => {
    // if (err) cb(err);
    // cb(null, articles);
  });
  // find article and return it if it exists
};

// getUserArticles
// getArticle
// getGroupArticles
