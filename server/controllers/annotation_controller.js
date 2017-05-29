import Annotation from '../models/annotation';
import * as Users from '../controllers/user_controller';

// direct access to a specific annotation
export const getAnnotation = (user, annotationId) => {
  return Annotation.findById(annotationId)
    .select('-childAnnotations')
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

// // access to all of an annotation's replies
export const getAnnotationReplies = (user, annotationId) => {
  return Annotation.findById(annotationId)
  .then((annotation) => {
    if (annotation === null) {
      return [];
    }
    return annotation.childAnnotations;
  });
};

export const createAnnotation = (user, body, article) => {
  const annotation = new Annotation();
  annotation.author = user;
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

// Get direct replies to parentId (verifying that user has access to this comment)
// Also succeeds if user is null and comment thread is public.
// Returns a promise.
export const getReplies = (user, parentId) => {
  const conditions = { parent: parentId };
  if (user === null) {
    conditions.isPublic = true;
  } else {
    conditions.$or = [{ groups: { $in: user.groups } }, { isPublic: true }];
  }
  return Annotation.find(conditions).select('-childAnnotations');
};

// PRECONDITION: user is not null.
export const editAnnotation = (user, annotationId, updateText) => {
  const conditions = { _id: annotationId, author: user._id };
  const update = { $set: { text: updateText, editDate: Date.now(), isEdited: true } };
  return Annotation.findOneAndUpdate(conditions, update, { new: true }).select('-childAnnotations');
};

// Removes an annotation from the database, updates the parent's numChildren
// and recurses if the parent needs to be removed as well.
const deleteAnnotationHelper = (annotation) => {
  if (annotation.parent === null) { // base case: annotation is top-level
    return annotation.remove();
  } else {
    return annotation.remove()
    .then((removed) => {
      return Annotation.findByIdAndUpdate(removed.parent, { $pull: { childAnnotations: removed._id } }, { new: true });
    })
    .then((parent) => {
      if (parent.isDeleted && parent.numChildren < 1) {
        // remove parent recursively
        return deleteAnnotationHelper(parent);
      } else {
        return parent;
      }
    });
  }
};

export const deleteAnnotation = (user, annotationId) => {
  return Annotation.findById(annotationId)
  .then((annotation) => {
    if (annotation === null) {
      throw new Error('Annotation to delete not found');
    }

    const promises = [];
    const author = annotation.author;
    if (author._id.toString() !== user._id.toString()) {
      if (user.isAdmin) {
        // send notification to author
        promises.push(Users.addUserNotification(author._id, 'adminDelete', null, annotation.discussionURI));
      } else {
        throw new Error('User cannot remove annotation');
      }
    }

    if (annotation.numChildren < 1) {
      // annotation has no children, so remove
      promises.push(deleteAnnotationHelper(annotation));
    } else {
      const deleteUpdate = {
        isDeleted: true,
        text: '[deleted]',
      };
      promises.push(annotation.update(deleteUpdate, { new: true }));
    }
    return Promise.all(promises);
  });
};
