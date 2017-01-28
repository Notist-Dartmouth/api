import { Router } from 'express';
import * as Users from './controllers/user_controller';
import path from 'path';

const router = Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

router.get('/home', (req, res) => {
  res.send('You are logged in.');
});

router.route('/users')
      .post(Users.createUser)
      .get(Users.getUsers)

export default router;
