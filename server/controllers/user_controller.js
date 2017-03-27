import User from '../models/user';

// TODO: addFollowing (add a user to the list of user's i am following)
// TODO: getUserArticles: Get all the articles of a given user
// TODO: getUserAnnotations: Get all the annotations made by a given user

// export const createUser = (req, res) => {
//   const user = new User();
//   user.name = req.body.name;
//   user.groupIds = req.body.groupIds;
//   user.save()
//       .then(result => {
//         res.json({ message: 'User created' });
//       })
//       .catch(error => {
//         res.json({ error });
//       });
// };

export const getUsers = (req, res) => {
  res.send('getting users');
};

export const addUserGroups = (userId, groups) => {
  const groupObjs = groups.map(group => { return { _id: group._id, name: group.name, isPersonal: group.isPersonal }; });
  return User.findByIdAndUpdate(userId, { $addToSet: { groups: { $each: groupObjs } } });
};

export const addUserGroup = (userId, group) => {
  return addUserGroups(userId, [group]);
};
