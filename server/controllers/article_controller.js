import Article from '../models/article';
import * as Groups from './group_controller';

// TODO: getArticleGroups: Get all the groups of a given article
// TODO: getArticlesFiltered: Get articles ordered, filtered by ____

// Precondition: this action is authorized
// TODO: Get title, body text from mercury?
export const createArticle = (uri, groups) => {
  const article = new Article();
  article.uri = uri;
  article.title = `Article at ${uri}`;
  article.groups = groups;
  return article.save()
  .then(result => {
    return Groups.addGroupArticle(result._id, groups)
    .then(res => {
      return result;
    });
  });
};

export const getArticle = (uri) => {
  const nURI = Article.normalizeURI(uri);
  return Article.findOne({ uri: nURI });
};

// export const addArticleAnnotation = (articleId, annotationId) => {
//   return Article.findByIdAndUpdate(articleId, { $addToSet: { annotations: annotationId } });
// };

export const addArticleAnnoChild = (articleId, annotationId, parentId) => {
  return Article.findByIdAndUpdate(articleId, { $addToSet: { annotations: annotationId } });
};

// TODO: Add filtering, return in order
// Get all annotations on an article, accessible by user, optionally in a specific set of groups
// If user is null, return public annotations.
// Returns a promise.

export const getArticleAnnotations = (user, uri, toplevelOnly) => {
  const conditions = {};
  if (user === null) {
    conditions.isPublic = true;
  } else {
    const groupIds = user.groups.map(group => { return group._id; });
    conditions.$or = [{ groups: { $in: groupIds } },
                      { isPublic: true },
                      { author: user._id }];
  }
  if (typeof toplevelOnly !== 'undefined' && toplevelOnly) {
    conditions.isTopLevel = true;
  }
  return getArticle(uri)
  .deepPopulate(['annotations.childAnnotations.childAnnotations.childAnnotations.childAnnotations.childAnnotations.childAnnotations'])
  .then(article => {
    if (article === null) {
      // article not in db, so there are no annotations
      return [];
    } else {
      return article.annotations;
    }
  });
};


// TODO: Get one level of children down from this instead
// Get top-level annotations on an article, accessible by user, optionally in a specific set of groups
// Equivalent to getArticleAnnotations, but only returns annotations with no ancestors.
// Returns a promise.
export const getTopLevelAnnotations = (user, articleId) => {
  return getArticleAnnotations(user, articleId, true);
};

/*
Add multiple groups to an article
Input:
  articleId: String article ID
  groupIds: Array of String group IDs
Output: Returns a promise that resolves with result of updating article.
*/
export const addArticleGroups = (articleId, groupIds) => {
  return Article.findByIdAndUpdate(articleId, { $addToSet: { groups: { $each: groupIds } } });
};
