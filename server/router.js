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

router.get('/api/article', (req, res) => {
  Articles.getAllArticles()
  .then(result => {
    res.setHeader('Content-Type', 'application/json');
    res.json({ 'SUCCESS': result });
  })
  .catch(err => {
    res.json({ 'ERROR': err });
  });
});

// We should only create articles when creating annotations
// router.post('/api/article', (req, res) => {
//   if (req.isAuthenticated()) {
//     const uri = req.body.uri;
//     const groupIds = req.body.groupIds;
//     Articles.createArticle(uri, groupIds)
//     .then(result => {
//       Groups.addGroupArticle(groupIds, result._id);
//       res.json({ created: result });
//     })
//     .catch(err => {
//       res.json({ error: err });
//     });
//   }
//   Articles.createArticle(req, res);
// });

router.route('/api/user')
      .post(Users.createUser)
      .get(Users.getUsers);

router.post('/api/group', (req, res) => {
  Groups.createGroup(req.body.name, req.body.description, req.body.creator)
  .then(result => {
    res.setHeader('Content-Type', 'application/json');
    res.json({ 'SUCCESS': result });
  })
  .catch(err => {
    res.json({ 'ERROR': err });
  });
});

router.get('/group/:id', (req, res) => {
  Groups.getGroup(req.params.id)
  .then(result => {
    res.setHeader('Content-Type', 'application/json');
    res.json({ 'SUCCESS': result });
  })
  .catch(err => {
    res.json({ 'ERROR': err });
  });
});

router.post('/api/annotations', (req, res) => {
  // Assumption: if isAuthenticated, user !== NULL
  if (req.isAuthenticated()) {
    const user = req.user;
    const body = req.body;
    // check if article exists, articleID
    let articleId;
    const groupIds = req.body.groupIds;
    const uri = req.body.uri;

    return Articles.getArticle({ uri })
    .then( article => {
      if (article === null) {
        return Articles.createArticle(uri, groupIds)
        .then( new_article => {
          articleId = new_article._id;
          return createAnnotation(user, body, articleId)
        })
      } else {
        articleId = article._id;
        return createAnnotation(user, body, articleId)
      }
    })
    .then( annotation => {
      res.json({ 'SUCCESS': annotation });
    })
    .catch(err => {
      res.json({ 'ERROR': err });
    });
    // LOGIC
    // if article already exists, get its ID
    // if article does not already exist, create it and get its ID
    // create the annotation with the article ID passed in
    // race two promises:
      // 1. article exists, get the ID
      // 2. article doesn't exist, create and get the ID
  //   Articles.getArticle({ uri })
  //   .then(result => {
  //     if (result === null) {
  //       Articles.createArticle(uri, groupIds)
  //       .then(article => {
  //         articleId = article._id;
  //       });
  //     } else {
  //       articleId = result._id;
  //     }
  //     Annotations.createAnnotation(user, body, articleId)
  //     .then(annotation => {
  //       res.json({ annotation });
  //     });
  //   })
  //   .catch(err => {
  //     res.json({ err });
  //   });
  // } else {
  //   res.status(401).end();
  // }
// });

router.get('/api/article/:id/annotations', (req, res) => {
  let user = null;
  if (req.isAuthenticated()) {
    user = req.user;
  }
  const articleId = req.params.id;
  console.log(articleId);
  Annotations.getArticleAnnotations(user, articleId)
  .then(result => {
    res.json({ 'SUCCESS': result });
  })
  .catch(err => {
    res.json({ 'ERROR': err });
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
    res.json({ 'SUCCESS': result });
  })
  .catch(err => {
    res.json({ 'ERROR': err });
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
    res.json({ 'SUCCESS': result });
  })
  .catch(err => {
    res.json({ 'ERROR': err });
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
        res.json({ 'ERROR': 'Annotation not found' });
      } else {
        res.json({ 'SUCCESS': result });
      }
    })
    .catch(err => {
      res.json({ 'ERROR': err });
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
