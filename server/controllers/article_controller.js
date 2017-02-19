import Article from '../models/article';
import Group from '../models/group';
import * as Groups from '../controllers/group_controller';

// Should only be called when creating annotations
export const createArticle = (uri, groupIds) => {
  const article = new Article();
  article.uri = uri;
  article.groups.push(groupIds);
  article.save().then(result => {
    Groups.addGroupArticle(groupIds, result._id);
  });
};

// getArticle
// getGroupArticles
export const getGroupArticles = (group) => {
  Article.find;
};

export const getArticle = (id) => {
  return Article.findById(id);
};
