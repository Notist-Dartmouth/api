import Annotation from '../models/annotation';

export const createAnnotation = (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user;
    const annotation = new Annotation();
    annotation.authorId = user._id;
    annotation.articleId = req.body.articleId;
    annotation.text = req.body.text;
    annotation.articleText = req.body.articleText;
    if (req.body.parentId) {
      Annotation.findById(req.body.parentId)
        .then(parent => {
          // inherit properties from parent
          annotation.groupIds = parent.groupIds;
          annotation.ancestors = parent.ancestors.concat([parent._id]);
          saveAnnotation(annotation, res);
        })
        .catch(err => {
          res.json({ err });
        });
    } else {
      annotation.groupIds = req.body.groupIds;
      annotation.ancestors = [];
      saveAnnotation(annotation, res);
    }
  } else {
    // not authenticated - send 401 Unauthorized
    res.status(401).end();
  }
};

const saveAnnotation = (annotation, res) => {
  annotation.save()
    .then(result => {
      const aid = annotation._id.valueOf();
      res.json({ message: 'Annotation ' + aid + ' created!' });
    })
    .catch(err => {
      res.json({ err });
    });
};

const intersectOIDArrays = (a, b) => {
  return a.filter(ael => b.map(bel => ael.equals(bel)).some(x => x));
}

// direct access to a specific annotation
export const getAnnotation = (req, res) => {
  if (req.isAuthenticated()) {
    const userGroups = req.user.groupIds;
    Annotation.findById(req.params.id)
      .then(antn => {
        var intersectGroups = intersectOIDArrays(userGroups, antn.groupIds);
        if (intersectGroups.length !== 0) {
          // user is authorized to view this annotation
          res.json(antn);
        } else {
          // not authorized - send 401 Unauthorized
          res.status(401).end();
        }
      })
      .catch(err => {
        res.json({ err });
      });
  } else {
    // TODO: show annotation if it's public
    res.status(401).end();
  }
};

// Get all annotations on an article, accessible by user, optionally in a specific set of groups
// If user is null, return public annotations.
// Returns a promise.
export const getArticleAnnotations = (user, articleId, groupIds, toplevelOnly) => {
  if (user !== null) {
    if (typeof groupIds == 'undefined' || groupIds === null) {
      var gidsToAccess = user.groupIds;
    } else {
      // find intersection between accessible and requested groups
      var gidsToAccess = intersectOIDArrays(user.groupIds, groupIds);
    }
    var conditions = {articleId: articleId, groupIds: {$in: gidsToAccess}};
    if (typeof toplevelOnly != 'undefined' && toplevelOnly) {
      conditions.ancestors = {$size: 0};
    }
    return Annotations.find(conditions).exec();
  } else {
    // TODO: return public annotations
    return Promise.resolve([]);
  }
};

// Get top-level annotations on an article, accessible by user, optionally in a specific set of groups
// Equivalent to getArticleAnnotations, but only returns annotations with no ancestors.
// Returns a promise.
export const getTopLevelAnnotations = (user, articleId, groupIds) => {
  return getArticleAnnotations(user, articleId, groupIds, true);
};

// Get all replies to parentId (verifying that user has access to this comment)
// Also succeeds if user is null and comment thread is public.
// Returns a promise.
export const getReplies = (user, articleId, parentId, directOnly) => {
  if (user === null) {
    // TODO: assign the appropriate public group
    var userGroups = [];
  } else {
    var userGroups = user.groupIds;
  }
  // check that the user has access
  return Annotations.findById(parentId)
    .then(parent => {
      if (intersectOIDArrays(parent.groupIds, userGroups).length === 0) {
        throw new Error('User does not have access to this annotation');
      }
      // user is authorized
      if (typeof directOnly == 'undefined' || !directOnly) {
        var conditions = {articleId: articleId, ancestors: {$in: [parentId]}};
      } else {
        var parentAncestors = parent.ancestors.length;
        var conditions = {$and: [{articleId: articleId},
                                 {ancestors: {$in: [parentId]}},
                                 {ancestors: {$size: parentAncestors + 1}}
                                ]
                          };
      }
      return Annotations.find(conditions).exec();
    });
};

// Get direct replies to parentId (verifying that user has access to this comment)
// Also succeeds if user is null and comment thread is public.
// Returns a promise.
export const getDirectReplies = (user, articleId, parentId) => {
  return getReplies(user, articleId, parentId, true);
}

export const editAnnotation = (req, res) => {
  if (req.isAuthenticated()) {
    const userId = req.user._id;
    Annotation.findById(req.params.id, 'authorId')
      .then(antn => {
        if (antn.authorId.equals(userId)) {
          // allow this edit
          var update = {};
          update.text = req.body.text;
          update.editDate = Date.now();
          Annotation.updateOne({_id: req.params.id}, update)
            .then(result => {
              res.json({ message: "Annotation " + req.params.id.valueOf() + " updated" });
            })
            .catch(err => {
              res.json({ err });
            })
        } else {
          // not the author - send 401 Unauthorized
          res.status(401).end();
        }
      })
      .catch(err => {
        res.json({ err });
      });
  } else {
    // not authenticated - send 401 Unauthorized
    res.status(401).end();
  }
};
