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


router.route('/api/group')
      .post(Groups.createGroup);

router.post('/api/annotations', (req, res) => {
  // Assumption: if isAuthenticated, user !== NULL
  if (req.isAuthenticated()) {
    const user = req.user;
    const body = req.body;
    Annotations.createAnnotation(user, body).then(result => {
      res.json({ message: result });
    })
    .catch(err => {
      res.json({ err });
    });
  } else {
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
  let user = null;
  if (req.isAuthenticated()) {
    user = req.user;
  }
  const annotationId = req.params.id;
  // for some reason only works with x-www-form-urlencoded body on postman
  // otherwise gets "undefined"
  const updateText = req.body.text;
  Annotations.editAnnotation(user, annotationId, updateText)
  .then( result => {
    res.json({ result });
  })
  .catch(err => {
    res.json({ err });
  });
});

router.get('/group/:id', (req, res) => {
  Groups.getGroup(req.params.id, (err, groupJSON) => {
    if (err) { res.send(`error: ${err}`); }
    res.setHeader('Content-Type', 'application/json');
    res.send(groupJSON);
  });
});


export default router;
