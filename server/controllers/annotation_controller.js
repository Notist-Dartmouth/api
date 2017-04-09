import Annotation from '../models/annotation';
import * as Articles from './article_controller';
import mongodb from 'mongodb';

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

  if (body.parent) {
    annotation.parent = body.parent;
  } else {
    annotation.parent = null;
    annotation.article = article;
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
