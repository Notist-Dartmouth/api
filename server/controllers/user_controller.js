import User from '../models/user';

// TODO: addFollowing (add a user to the list of user's i am following)
// TODO: getUserArticles: Get all the articles of a give user

export const createUser = (req, res) => {
  const user = new User();
  user.name = req.body.name;
  user.groupIds = req.body.groupIds;
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
