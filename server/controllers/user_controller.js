import User from '../models/user';
import Annotation from '../models/annotation';

export const getUsers = (req, res) => {
  res.send('getting users');
};

export const addUserGroups = (userId, groupIds) => {
  return User.findByIdAndUpdate(userId, { $addToSet: { groups: { $each: groupIds } } }, { new: true });
};

export const addUserGroup = (userId, groupId) => {
  return addUserGroups(userId, [groupId]);
};

export const getUserAnnotations = (userId) => {
  return Annotation.find({ author: userId }).sort({ date: -1 });
};
