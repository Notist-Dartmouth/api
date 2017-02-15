import { Router } from 'express';
import * as Users from './controllers/user_controller';
import * as Articles from './controllers/article_controller';
import * as Annotations from './controllers/annotation_controller';
import * as Groups from './controllers/group_controller';

import path from 'path';

const router = Router();

// TODO: Deal with errors like goddamn adults instead of ignoring them

router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.sendFile(path.join(__dirname, 'login.html'));
  }
});

router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.user.name, 'is logged in.');
    res.sendFile(path.join(__dirname, 'home.html'));
  } else {
    res.redirect('/login');
  }
});

router.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/login');
});

router.get('/api/articles', (req, res) => {
  Articles.getArticles((err, articles) => {
    if (err) { res.send(`error: ${err}`); }
    res.render('articles', { articles });
  });
});

router.post('/api/article', (req, res) => {
  Articles.createArticle(req, res);
});


router.route('/api/user')
      .post(Users.createUser)
      .get(Users.getUsers);

router.post('/api/annotations', (req, res) => {
  // Assumption: if isAuthenticated, user !== NULL
  if (req.isAuthenticated()) {
    const user = req.user;
    const body = req.body;
    Annotations.createAnnotation(user, body).then(result => {
      res.json({ added: result });
    })
    .catch(err => {
      res.json({ err });
    });
  } else {
    // send 401 Unauthorized.
    res.status(401).end();
  }
});

router.get('/api/article/:id/annotations', (req, res) => {
  let user = null;
  if (req.isAuthenticated()) {
    user = req.user;
  }
  const articleId = req.params.id;
  console.log(articleId);
  Annotations.getArticleAnnotations(user, articleId)
  .then(result => {
    res.json({ result });
  })
  .catch(err => {
    res.json({ err });
  });
});


router.get('/api/annotation/:id', (req, res) => {
  let user = null;
  if (req.isAuthenticated()) {
    user = req.user;
  }
  const annotationId = req.params.id;
  Annotations.getAnnotation(user, annotationId)
  .then(result => {
    res.json({ result });
  })
  .catch(err => {
    res.json({ err });
  });
});

router.get('/api/annotation/:id/replies', (req, res) => {
  let user = null;
  if (req.isAuthenticated()) {
    user = req.user;
  }
  const annotationId = req.params.id;
  Annotations.getReplies(user, annotationId)
  .then(result => {
    res.json({ result });
  })
  .catch(err => {
    res.json({ err });
  });
});

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
        res.json({ err: 'Annotation not found' });
      } else {
        res.json({ edited: result });
      }
    })
    .catch(err => {
      res.json({ err });
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
        res.json({ err: 'Group not created' });
      } else {
        res.json({ created: result });
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
        res.json({ err: 'Group not found.' });
      } else {
        res.json({ group: result });
        // res.setHeader('Content-Type', 'application/json');
        // res.send(groupJSON);
      }
    })
    .catch(err => {
      res.json({ err });
    });
  } else {
    // send 401 unauthorized
    res.status(401).end();
  }
});


export default router;
