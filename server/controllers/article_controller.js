import Article from '../models/article';
import * as Groups from './group_controller';

// TODO: getArticleGroups: Get all the groups of a given article
// TODO: getArticlesFiltered: Get articles ordered, filtered by ____

export const createArticle = (uri, groupIds) => {
  const article = new Article();
  article.uri = uri;
  article.groups = groupIds;
  return article.save()
  .then(result => {
    return Groups.addGroupArticle(result._id, groupIds)
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
