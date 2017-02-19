import Article from '../models/article';
import Group from '../models/group';

// Should only be called when creating annotations
export const createArticle = (uri, groupIds) => {
  const article = new Article();
  article.uri = uri;
  article.groups = groupIds;
  return article.save()
  .then(result => {
    Group.addGroupArticle(groupIds, result._id);
  });
};

export const getArticle = (uri) => {
  console.log(uri);
  return Article.findOne({ uri });
  // find article and return it if it exists
};

// getUserArticles
// getArticle
// getGroupArticles
