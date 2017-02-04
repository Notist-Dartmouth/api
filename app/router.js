import { Router } from 'express';
import * as Users from './controllers/user_controller';
import * as Articles from './controllers/article_controller';
import path from 'path';

const router = Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

router.get('/home', (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, 'home.html'));
  } else {
    res.redirect('/');
  }
});

router.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

router.route('/users')
      .post(Users.createUser)
      .get(Users.getUsers)

export default router;
