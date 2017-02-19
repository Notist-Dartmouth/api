import { Router } from 'express';
import * as Users from './controllers/user_controller';
import * as Articles from './controllers/article_controller';
import * as Annotations from './controllers/annotation_controller';
import * as Groups from './controllers/group_controller';
import serializeError from 'serialize-error';

import path from 'path';

const router = Router();

// TODO: Deal with errors like goddamn adults instead of ignoring them

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

// retrieve all articles
router.get('/api/article', (req, res) => {
  Articles.getAllArticles()
  .then(result => {
    res.setHeader('Content-Type', 'application/json');
    res.json({ SUCCESS: result });
  })
  .catch(err => {
    res.json({ ERROR: serializeError(err) });
  });
});

// create new article
router.post('/api/article', (req, res) => {
  Articles.createArticle(req.body.uri, req.body.group)
  .then(result => {
    console.log(result);
    res.setHeader('Content-Type', 'application/json');
    res.json({ SUCCESS: result });
    console.log(res);
  })
  .catch(err => {
    res.json({ ERROR: serializeError(err) });
  });
});

// TODO: are we using this?
router.route('/api/user')
      .post(Users.createUser)
      .get(Users.getUsers);

// create new group
router.post('/api/group', (req, res) => {
  Groups.createGroup(req.body.name, req.body.description, req.body.creator)
  .then(result => {
    res.setHeader('Content-Type', 'application/json');
    res.json({ SUCCESS: result });
  })
  .catch(err => {
    res.json({ ERROR: serializeError(err) });
  });
});

// get specific group
router.get('/group/:id', (req, res) => {
  Groups.getGroup(req.params.id)
  .then(result => {
    res.setHeader('Content-Type', 'application/json');
    res.json({ SUCCESS: result });
  })
  .catch(err => {
    res.json({ ERROR: serializeError(err) });
  });
});

// create new annotation
router.post('/api/annotation', (req, res) => {
  // Assumption: if isAuthenticated, user !== NULL
  if (req.isAuthenticated()) {
    const user = req.user;
    const body = req.body;
    // check if article exists, articleID
    let articleId;
    const groupIds = req.body.groupIds;
    const uri = req.body.uri;
    console.log(body);
    Articles.getArticle(uri)
    .then(article => {
      if (article === null) {
        return Articles.createArticle(uri, groupIds)
        .then(newArticle => {
          console.log('created new article!');
          console.log(newArticle);
          articleId = newArticle._id;
          return Annotations.createAnnotation(user, body, articleId);
        });
      } else {
        console.log('found previous article!');
        console.log(article._id);
        articleId = article._id;
        return Annotations.createAnnotation(user, body, articleId);
      }
    })
    .then(annotation => {
      res.json({ SUCCESS: annotation });
    })
    .catch(err => {
      res.json({ ERROR: serializeError(err) });
    });
  } else {
    // send 401 unauthorized
    res.status(401).end();
  }
});

    // LOGIC
    // if article already exists, get its ID
    // if article does not already exist, create it and get its ID
    // create the annotation with the article ID passed in
    // race two promises:
      // 1. article exists, get the ID
      // 2. article doesn't exist, create and get the ID

// get annotations on an article
router.get('/api/article/:id/annotations', (req, res) => {
  let user = null;
  if (req.isAuthenticated()) {
    user = req.user;
  }
  const articleId = req.params.id;
  console.log(articleId);
  Annotations.getArticleAnnotations(user, articleId)
  .then(result => {
    res.json({ SUCCESS: result });
  })
  .catch(err => {
    res.json({ ERROR: serializeError(err) });
  });
});

// get specific annotation
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

// get replies to an annotation
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

// edit an annotation
router.post('/api/annotation/:id/edit', (req, res) => {
  if (req.isAuthenticated()) {
    const userId = req.user._id;
    const annotationId = req.params.id;
    // for some reason only works with x-www-form-urlencoded body on postman
    // otherwise gets "undefined"
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

router.post('/api/group', (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req);
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

router.get('/api/group/:id', (req, res) => {
  console.log(req.isAuthenticated());
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
