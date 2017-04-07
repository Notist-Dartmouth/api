import Article from '../models/article';
import * as Groups from './group_controller';

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


/*
Get a list of articles, filtered by some conditions.
Input:
  query: A mongodb query selector object
Output: Resolves to a list of matching groups
Example:
  Articles.getArticlesFiltered({
    title: /hamilton/i,
    isSatire: false,
    groups: someGroup._id,
  });
*/
export const getArticlesFiltered = (query) => {
  if (typeof query !== 'object') {
    return Promise.reject(new Error('Invalid article query'));
  }
  return Article.find(query);
};

export const addArticleAnnotation = (articleId, annotationId) => {
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
    conditions.$or = [{ groups: { $in: user.groups } },
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

/*
Get an array of the groups an article belongs to
Input:
  articleId: String article ID
Output: Returns a promise that rejects if the article is not found
 and otherwise resolves to an array of the group objects the article belongs to.
*/
export const getArticleGroups = (articleId) => {
  return Article.findById(articleId)
  .populate('groups')
  .select('groups')
  .exec()
  .then(article => {
    if (article === null) {
      // reject since this shouldn't be an expected situation, if we have an articleId
      throw new Error('Article not found');
    } else {
      return article.groups;
    }
  });
};
