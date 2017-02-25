import { Router } from 'express';
import * as Users from './controllers/user_controller';
import * as Articles from './controllers/article_controller';
import * as Annotations from './controllers/annotation_controller';
import * as Groups from './controllers/group_controller';
import serializeError from 'serialize-error';

import path from 'path';

const router = Router();

// TODO: Deal with errors like goddamn adults instead of ignoring them
// TODO: Make style more consistent across all the endpoints
// TODO: More validation of things existing before adding/doing stuff with them
// TODO: How to do context stuff

/* RESPONSES
  POST -> {success: {stuff just posted}}
  GET -> {stuff requested}
  DELETE -> {success}
*/

// navigate to login page
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.sendFile(path.join(__dirname, 'login.html'));
  }
});

// navigate to home page
router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.user.name, 'is logged in.');
    res.sendFile(path.join(__dirname, 'home.html'));
  } else {
    res.redirect('/login');
  }
});

// navigate to logout page
router.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/login');
});


// TODO: Rewrite this endpoint; getAllArticles is no longer a function
// router.get('/api/article', (req, res) => {
//   Articles.getAllArticles()
//   .then(result => {
//     res.setHeader('Content-Type', 'application/json');
//     res.json({ SUCCESS: result });
//   })
//   .catch(err => {
//     res.json({ ERROR: serializeError(err) });
//   });
// });

/*
Create a new article.
Input:
  req.body.uri: String uri of the article
  req.body.groupIds: Array of String group IDs to which article belongs
Output: Returns json file with the created article or error.
*/
router.post('/api/article', (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user;
    const uri = req.body.uri;
    const groupIds = req.body.groupIds;

    if (!user.isMemberOfAll(groupIds)) {
      const err = new Error('User not authorized to add article to one or more groups');
      res.json({ ERROR: serializeError(err) });
    }

    Articles.createArticle(user, uri, groupIds)
    .then(result => {
      res.json({ SUCCESS: result });
    })
    .catch(err => {
      res.json({ ERROR: serializeError(err) });
    });
  } else {
    // send 401 unauthorized
    res.status(401).end();
  }
});

// TODO: Decide what to do with users
router.route('/api/user')
      .post(Users.createUser)
      .get(Users.getUsers);

/*
Create a new group.
Input:
  req.body.name: String name of the group
  req.body.description: String description of the group
  req.body.creator: String user ID of the group creator
Output: Returns json file with the created group or error.
*/
// TODO: Check for user authentication
router.post('/api/group', (req, res) => {
  Groups.createGroup(req.body.name, req.body.description, req.body.creator)
  .then(result => {
    res.json({ SUCCESS: result });
  })
  .catch(err => {
    res.json({ ERROR: serializeError(err) });
  });
});

/*
Get a specific group.
Input:
  req.params.id: String ID of the group
Output: Returns json file with the group information or error.
*/
// TODO: Clarify the point of this endpoint, should it get all the articles or
// annotations, or be like a history/info about the group?
router.get('/api/group/:id', (req, res) => {
  Groups.getGroup(req.params.id)
  .then(result => {
    res.json({ SUCCESS: result });
  })
  .catch(err => {
    res.json({ ERROR: serializeError(err) });
  });
});

/*
Add a user to a specific group as a member.
Input:
  req.params.groupId: String group ID
  req.params.userId: String user ID to be added to the group.
Output: Returns json file with the updated group information.
*/
// TODO: Clarify the point of this endpoint, should it get all the articles or
// annotations, or be like a history/info about the group?
router.post('/api/group/:groupId/user/:userId', (req, res) => {
  Groups.addGroupMember(req.params.groupId, req.params.userId)
  .then(result => {
    res.json({ SUCCESS: result });
  })
  .catch(err => {
    res.json({ ERROR: serializeError(err) });
  });
});

/*
Create a new annotation.
Input:
  req.body.groupIds: Array of String group IDs
  req.body.uri: String uri of the annotation's article
  req.body.articleText: String of the article's relevant text
  req.body.parentId: null or String of the parent's annotation ID
  req.body.isPublic: boolean of whether the annotation will be publicly visible
Output: Returns json file of the new annotation or error.
*/
// TODO: Should createAnnotation take in body or better to parse out all the params here?
// TODO: Parents should keep track of children in the level directly below
router.post('/api/annotation', (req, res) => {
  // Assumption: if isAuthenticated, user !== NULL
  if (req.isAuthenticated()) {
    const user = req.user;
    const body = req.body;
    // check if article exists, articleID
    let articleId;
    const groupIds = req.body.groupIds;
    const uri = req.body.uri;

    if (!user.isMemberOfAll(groupIds)) {
      const err = new Error('User not authorized to add annotation to one or more groups');
      res.json({ ERROR: serializeError(err) });
    }

    Articles.getArticle(uri)
    .then(article => {
      if (article === null) {
        return Articles.createArticle(uri, groupIds)
        .then(newArticle => {
          articleId = newArticle._id;
          return Annotations.createAnnotation(user, body, articleId);
        });
      } else {
        // TODO: if article already exists, it needs to be added to a group
        articleId = article._id;
        return Annotations.createAnnotation(user, body, articleId);
      }
    })
    .then(annotation => {
      Articles.addArticleAnnotation(articleId, annotation._id)
      .then(result => {
        res.json({ SUCCESS: annotation });
      });
    })
    .catch(err => {
      res.json({ ERROR: serializeError(err) });
    });
  } else {
    // send 401 unauthorized
    res.status(401).end();
  }
});

// TODO: endpoint to get top level annotations & level 1 child

/*
Get annotations of an article
Input:
  req.params.id: String article ID
Output: Returns json file of the article's annotations or error.
*/
router.get('/api/article/:id/annotations', (req, res) => {
  let user = null;
  if (req.isAuthenticated()) {
    user = req.user;
  }
  const articleId = req.params.id;
  Annotations.getArticleAnnotations(user, articleId)
  .then(result => {
    res.json({ SUCCESS: result });
  })
  .catch(err => {
    res.json({ ERROR: serializeError(err) });
  });
});

/*
Get specific annotation.
Input:
  req.params.id: String annotation ID
Output: Returns json file of the annotation or error.
*/
router.get('/api/annotation/:id', (req, res) => {
  let user = null;
  if (req.isAuthenticated()) {
    user = req.user;
  }
  const annotationId = req.params.id;
  Annotations.getAnnotation(user, annotationId)
  .then(result => {
    res.json({ SUCCESS: result });
  })
  .catch(err => {
    res.json({ ERROR: serializeError(err) });
  });
});

/*
Get replies to an annotation
Input:
  req.params.id: String annotation ID
Output: Returns json file of the annotation's replies or error.
*/
router.get('/api/annotation/:id/replies', (req, res) => {
  let user = null;
  if (req.isAuthenticated()) {
    user = req.user;
  }
  const annotationId = req.params.id;
  Annotations.getReplies(user, annotationId)
  .then(result => {
    res.json({ SUCCESS: result });
  })
  .catch(err => {
    res.json({ ERROR: serializeError(err) });
  });
});

/*
Edit specific annotation.
Input:
  req.params.id: String annotation ID
Output: Returns json file of the edited annotation or error.
*/
router.post('/api/annotation/:id/edit', (req, res) => {
  if (req.isAuthenticated()) {
    const userId = req.user._id;
    const annotationId = req.params.id;
    const updateText = req.body.text;
    Annotations.editAnnotation(userId, annotationId, updateText)
    .then(result => {
      if (result === null) {
        // either the annotation doesn't exist or wasn't written by this user
        const err = new Error('Annotation not found');
        res.json({ ERROR: serializeError(err) });
      } else {
        res.json({ SUCCESS: result });
      }
    })
    .catch(err => {
      res.json({ ERROR: serializeError(err) });
    });
  } else {
    // send 401 unauthorized
    res.status(401).end();
  }
});

/*
Create a new group.
Input:
  req.body.name: String name of the group
  req.body.description: String description of the group
Output: Returns json file of the new group or error.
*/
router.post('/api/group', (req, res) => {
  if (req.isAuthenticated()) {
    const name = req.body.name;
    const description = req.body.description;
    const userId = req.user._id;
    Groups.createGroup(name, description, userId)
    .then(result => {
      if (result === null) {
        const err = new Error('Group not created');
        res.json({ ERROR: serializeError(err) });
      } else {
        res.json({ SUCCESS: result });
      }
    });
  }
});

/*
Create a new group.
Input:
  req.params.groupId: String group ID
Output: Returns json file of the group or error.
*/
router.get('/api/group/:id', (req, res) => {
  if (req.isAuthenticated()) {
    const groupId = req.params.id;
    const userId = req.user._id;
    Groups.getGroup(userId, groupId)
    .then(result => {
      if (result === null) {
        const err = new Error('Group not found');
        res.json({ ERROR: serializeError(err) });
      } else {
        res.json({ SUCCESS: result });
      }
    })
    .catch(err => {
      res.json({ ERROR: serializeError(err) });
    });
  } else {
    // send 401 unauthorized
    res.status(401).end();
  }
});

export default router;
