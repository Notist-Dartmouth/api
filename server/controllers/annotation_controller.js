import Annotation from '../models/annotation';

// PRECONDITION: user is not null.
export const createAnnotation = (user, body) => {
  const annotation = new Annotation();
  annotation.authorId = user._id;
  annotation.text = body.text;
  if (body.parentId) {
    return Annotation.findById(body.parentId)
      .then(parent => {
        // inherit properties from parent
        annotation.articleText = parent.articleText;
        annotation.articleId = parent.articleId;
        annotation.groupIds = parent.groupIds;
        annotation.ancestors = parent.ancestors.concat([parent._id]);
        annotation.isPublic = parent.isPublic;
        // check that user is allowed to post to the groups
        if (user.isMemberOfAll(annotation.groupIds)) {
          return annotation.save();
        } else {
          const err = { notistDescription: 'Not authorized for these groups' };
          throw err;
        }
      })
      .catch(err => {
        const newErr = err;
        newErr.notistDescription = 'Error finding parent annotation';
        throw newErr;
      });
  } else {
    annotation.articleText = body.articleText;
    annotation.articleId = body.articleId;
    annotation.ancestors = [];
    annotation.isPublic = body.isPublic;
    annotation.groupIds = body.groupIds;
    // check that user is allowed to post to the groups
    if (user.isMemberOfAll(annotation.groupIds)) {
      return annotation.save();
    } else {
      const err = { notistDescrpition: 'Not authorized for these groups' };
      return Promise.reject(err);
    }
  }
};

// direct access to a specific annotation
export const getAnnotation = (user, annotationId) => {
  const conditions = { _id: annotationId };
  if (user === null) {
    conditions.isPublic = true;
  } else {
    conditions.$or = [{ groupIds: { $in: user.groupIds } }, { isPublic: true }];
  }
  return Annotation.find(conditions);
};

// Get all annotations on an article, accessible by user, optionally in a specific set of groups
// If user is null, return public annotations.
// Returns a promise.
export const getArticleAnnotations = (user, articleId, toplevelOnly) => {
  const conditions = { articleId };
  if (user === null) {
    conditions.isPublic = true;
  } else {
    conditions.$or = [{ groupIds: { $in: user.groupIds } }, { isPublic: true }];
  }
  if (typeof toplevelOnly !== 'undefined' && toplevelOnly) {
    conditions.ancestors = { $size: 0 };
  }
  return Annotation.find(conditions);
};

// Get top-level annotations on an article, accessible by user, optionally in a specific set of groups
// Equivalent to getArticleAnnotations, but only returns annotations with no ancestors.
// Returns a promise.
export const getTopLevelAnnotations = (user, articleId) => {
  return getArticleAnnotations(user, articleId, true);
};

// Get all replies to parentId (verifying that user has access to this comment)
// Also succeeds if user is null and comment thread is public.
// Returns a promise.
export const getReplies = (user, parentId) => {
  const conditions = { ancestors: { $in: [parentId] } };
  if (user === null) {
    conditions.isPublic = true;
  } else {
    conditions.$or = [{ groupIds: { $in: user.groupIds } }, { isPublic: true }];
  }
  return Annotation.find(conditions);
};

// PRECONDITION: user is not null.
export const editAnnotation = (userId, annotationId, updateText) => {
  const conditions = { _id: annotationId, authorId: userId };
  const update = { $set: { text: updateText, editDate: Date.now() } };
  return Annotation.findOneAndUpdate(conditions, update, { new: true });
};
