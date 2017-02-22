import Article from '../models/article';
import * as Groups from './group_controller';

export const createArticle = (uri, groupIds) => {
  const article = new Article();
  article.uri = uri;
  article.groups = groupIds;
  return article.save()
  .then(result => {
    Groups.addGroupArticle(groupIds, result._id);
    return result;
  });
};

export const getArticle = (uri) => {
  Article.findOne({ uri })
  .then(result => {
    return result;
  });
};

export const addArticleAnnotation = (articleId, annotationId) => {
  Article.findByIdAndUpdate(articleId, { $push: { annotations: annotationId } })
  .then(result => {
    return result;
  });
};

// getUserArticles
// getArticle
// getGroupArticles
