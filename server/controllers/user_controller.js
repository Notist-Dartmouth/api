import User from '../models/user';

// TODO: addFollowing (add a user to the list of user's i am following)
// TODO: getUserArticles: Get all the articles of a given user
// TODO: getUserAnnotations: Get all the annotations made by a given user


export const getUsers = (req, res) => {
  res.send('getting users');
};

export const addUserGroups = (userId, groupIds) => {
  return User.findByIdAndUpdate(userId, { $addToSet: { groups: { $each: groupIds } } }, { new: true });
};

export const addUserGroup = (userId, groupId) => {
  return addUserGroups(userId, [groupId]);
};

export const removeUserGroup = (userId, groupId) => {
  return User.findByIdAndUpdate(userId, { $pull: { groups: groupId } }, { new: true });
};
