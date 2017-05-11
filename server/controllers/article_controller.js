import Article from '../models/article';
import * as Groups from './group_controller';
import Annotation from '../models/annotation';

import mongodb from 'mongodb';
const ObjectId = mongodb.ObjectId;

// Precondition: this action is authorized
// TODO: Get title, body text from mercury?
export const createArticle = (uri, groups) => {
  const article = new Article();
  article.uri = uri;
  article.groups = groups;
  return article.save()
  .then((result) => {
    return Groups.addGroupArticle(result._id, groups) // TODO: move to post-save
    .then((res) => {
      return result;
    });
  });
};

// Query must be JSON with an "uri" field
export const getArticle = (uri, query) => {
  if (!query) {
    query = {};
  }

  const nURI = Article.normalizeURI(uri);
  query.uri = nURI;
  return Article.findOne(query);
};


/*
Get a list of articles, filtered by some conditions.
Input:
  filter: A mongodb query selector object
  options: pagination/sort options (pagination.skip, pagination.limit, and sort)
Output: Resolves to a list of matching groups
Example:
  Articles.getArticlesFiltered({
    title: /hamilton/i,
    isSatire: false,
    groups: someGroup._id,
  });
*/
export const getArticlesFiltered = (filter, options) => {
  if (typeof filter !== 'object') {
    return Promise.reject(new Error('Invalid article filter'));
  }

  let query = Article.find(filter);
  if (typeof options === 'object') {
    if (options.sort) {
      query = query.sort(options.sort);
    }
    if (options.pagination.skip) {
      query = query.skip(options.pagination.skip);
    }
    if (options.pagination.limit) {
      query = query.limit(options.pagination.limit);
    }
  }
  return query;
};

export const getPublicArticlesPaginated = (conditions) => {
  if (!conditions) {
    conditions = { pagination: {}, sort: {} };
  }

  const pagination = conditions.pagination || {};
  if (!typeof(conditions.sort) === 'object' || Object.keys(conditions.sort).length === 0) {
    conditions.sort = { createDate: -1 };
  }

  return Annotation.distinct('article', { isPublic: true })
  .then(articles => {
    return Article.find({ _id: { $in: articles } })
    .sort(conditions.sort)
    .skip(pagination.skip)
    .limit(pagination.limit);
  });
};

export const addArticleAnnotation = (articleId, annotationId) => {
  return Article.findByIdAndUpdate(articleId, { $addToSet: { annotations: annotationId } });
};

// TODO: Add filtering, return in order
// Get all annotations on an article, accessible by user, optionally in a specific set of groups
// If user is null, return public annotations.
// Returns a promise.

export const getArticleAnnotations = (user, uri, topLevelOnly) => {
  const query = { parent: null };
  if (user === null) {
    query.isPublic = true;
  } else {
    query.$or = [{ groups: { $in: user.groups } },
                 { isPublic: true },
                 { author: user._id }];
  }

  const populateOptions = { path: 'annotations' };
  if (topLevelOnly) {
    populateOptions.select = '-childAnnotations';
  }
  return getArticle(uri)
  .populate(populateOptions)
  .then((article) => {
    if (article === null) {
      return [];
    }
    return article.annotations;
  });
};

/*
* Get all annotations on an article but as dictated by pagination options
*/
export const getArticleAnnotationsPaginated = (user, conditions) => {
  const query = conditions.query;
  const pagination = conditions.pagination;
  let sortOptions = {};

  // TODO: sorting needs work
  if (pagination.last && !pagination.sort) { // Default is to sort in order of most recent annotation
    query._id = { $lt: new ObjectId(pagination.last) };
    sortOptions = { createDate: -1 };
    // query = { conditions.query, article, _id: { $gt: new ObjectId(pagination.last) } }; // should be less than if sorting in decreasing
  } else if (pagination.last && pagination.sort && pagination.sort_dir === -1) { // NOTE: right now must be sorting on DATES
    query[pagination.sort] = { $lt: new ObjectId(pagination.last) };
    sortOptions[pagination.sort] = -1;
  } else if (pagination.last && pagination.sort && pagination.sort_dir === 1) {
    query[pagination.sort] = { $gt: new ObjectId(pagination.last) };
    sortOptions[pagination.sort] = 1;
  }

  if (conditions.topLevelOnly) {
    return Annotation.find(query)
    .sort(sortOptions)
    .limit(pagination.limit)
    .select('-childAnnotations');
  } else {
    return Annotation.find(query)
    .sort(sortOptions)
    .limit(pagination.limit);
  }
};


/*
Get the number of replies to an article
Input:
  user: User object
  uri: String article uri
Output: Number of replies.
*/
export const getArticleReplyNumber = (user, uri) => {
  return getArticleAnnotations(user, uri, false)
  .then((annotations) => {
    const stringAnno = JSON.stringify(annotations);
    const count = (stringAnno.match(/points/g) || []).length;
    return count;
  });
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
  .then((article) => {
    if (article === null) {
      // reject since this shouldn't be an expected situation, if we have an articleId
      throw new Error('Article not found');
    } else {
      return article.groups;
    }
  });
};
