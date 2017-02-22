import Article from '../models/article';
import * as Groups from './group_controller';

export const createArticle = (uri, groupIds) => {
  const article = new Article();
  article.uri = uri;
  article.groups = groupIds;
  return article.save()
  .then(result => {
    Groups.addArticleToGroups(result._id, groupIds)
    .then(res => {
      return result;
    });
  });
};

export const getArticle = (uri) => {
  return Article.findOne({ uri });
};

export const addArticleAnnotation = (articleId, annotationId) => {
  return Article.findByIdAndUpdate(articleId, { $push: { annotations: annotationId } });
};

// getUserArticles
// getArticle
// getGroupArticles
