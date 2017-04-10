import Annotation from '../models/annotation';

// direct access to a specific annotation
export const getAnnotation = (user, annotationId) => {
  return Annotation.findById(annotationId)
    .then((annotation) => {
      if (annotation === null) {
        throw new Error('Annotation not found');
      }

      let isAuthorized = annotation.isPublic;
      if (user !== null) {
        isAuthorized = isAuthorized || user.isMemberOfAny(annotation.groups);
      }

      if (!isAuthorized) {
        throw new Error('Not authorized to access this annotation');
      }

      return annotation;
    });
};


export const createAnnotation = (user, body, article) => {
  const annotation = new Annotation();
  annotation.author = user;
  annotation.username = user.username; // I dont think we should do this -- wht if user chnges usernme??
  annotation.text = body.text;
  annotation.article = article;

  if (body.parent) {
    annotation.parent = body.parent;
  } else {
    annotation.parent = null;
    annotation.articleText = body.articleText;
    annotation.ranges = body.ranges;
    annotation.isPublic = body.isPublic;
    annotation.groups = body.groups || [];
  }
  return annotation.save();
};

// Get all replies to parentId (verifying that user has access to this comment)
// Also succeeds if user is null and comment thread is public.
// Returns a promise.
export const getReplies = (user, parentId) => {
  const conditions = { parent: parentId };
  if (user === null) {
    conditions.isPublic = true;
  } else {
    conditions.$or = [{ groups: { $in: user.groups } }, { isPublic: true }];
  }
  return Annotation.find(conditions);
};

// PRECONDITION: user is not null.
export const editAnnotation = (userId, annotationId, updateText) => {
  const conditions = { _id: annotationId, authorId: userId };
  const update = { $set: { text: updateText, editDate: Date.now(), edited: true } };
  return Annotation.findOneAndUpdate(conditions, update, { new: true });
};

// Removes an annotation from the database, updates the parent's numChildren
// and recurses if the parent needs to be removed as well.
const deleteAnnotationHelper = (user, annotation) => {
  if (annotation.parent === null) { // base case: annotation is top-level
    return annotation.remove(user, (result) => {});
  } else {
    return annotation.remove(user)
    .then((removed) => {
      return Annotation.findByIdAndUpdate(removed.parent, { $inc: { numChildren: -1 } }, { new: true });
    })
    .then((parent) => {
      if (parent.deleted && parent.numChildren < 1) {
        // remove parent recursively
        return deleteAnnotationHelper(user, parent);
      } else {
        return parent;
      }
    });
  }
};

export const deleteAnnotation = (user, annotationId) => {
  const deleteUpdate = {
    deleted: true,
    text: '[deleted]',
  };
  return Annotation.findByIdAndUpdate(annotationId, deleteUpdate, { new: true })
  .then((annotation) => {
    if (annotation === null) {
      throw new Error('Annotation to delete not found');
    }
    if (annotation.numChildren < 1) {
      // annotation has no children, so remove
      return deleteAnnotationHelper(user, annotation);
    } else {
      return annotation;
    }
  });
};
