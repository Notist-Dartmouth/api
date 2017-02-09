import User from '../models/user';

export const createUser = (req, res) => {
  const user = new User();
  user.name = req.body.name;
  user.groupIds = ['567856875678567856875678'];
  user.save()
      .then(result => {
        res.json({ message: 'User created' });
      })
      .catch(error => {
        res.json({ error });
      });
};

export const getUsers = (req, res) => {
  res.send('getting users');
};
