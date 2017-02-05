import { Router } from 'express';
import * as Users from './controllers/user_controller';
import * as Groups from './controllers/group_controller';
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
    console.log(req.user.name, 'is logged in.')    
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

router.route('/users') 
      .post(Users.createUser)
      .get(Users.getUsers)

router.route('/groups')
      .post(Groups.createGroup)
      .get(Groups.getGroup)

export default router;
