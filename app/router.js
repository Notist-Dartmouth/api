import { Router } from 'express';
import * as Users from './controllers/user_controller';
import * as Annotations from './controllers/annotation_controller';
import path from 'path';

const router = Router();

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

const error404 = function(req, res) {
  res.status(404).end();
}

router.route('/api/user')
      .post(Users.createUser)
      .get(Users.getUsers);

router.route('/api/annotations')
      .post(Annotations.createAnnotation)
      .get(error404);

router.route('/api/annotations/:id')
      .get(Annotations.getAnnotation)
      .put(Annotations.editAnnotation);

export default router;
