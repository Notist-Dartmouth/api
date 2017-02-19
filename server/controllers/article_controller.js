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

// getUserArticles
// getArticle
// getGroupArticles
export const getArticle = (id) => {
  return Article.findById(id);
};
