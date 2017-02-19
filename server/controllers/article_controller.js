import Article from '../models/article';
import * as Groups from './group_controller';

// Should only be called when creating annotations
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
  return Article.findOne({ uri });
  // find article and return it if it exists
};

export const addArticleAnnotation = (articleId, annotationId) => {
  return Article.findByIdAndUpdate(articleId, { $push: { annotations: annotationId } });
};

// getUserArticles
// getArticle
// getGroupArticles
