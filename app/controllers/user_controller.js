import User from '../models/user';

export const createUser = (req, res) => {
  const user = new User();
  user.name = req.body.name;
  user.save()
      .then(result => {
	res.json({ message: 'User created' });
      })
      .catch(error => {
	res.json({ error });
      });
};

export const getUsers = (req, res) => {
  res.send('blah blah');
}
