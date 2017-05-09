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

export const postUserExploreNumber = (user, explore_num, num_friends) => {
  user.exploreNumber = explore_num;
  return user.save();
};

export const updateUserExploreNumber = (user, value) => {
  const old_avg = user.exploreNumber;
  const new_avg = ((old_avg * user.numExplorations) + value) / (user.numExplorations + 1);

  // TODO: should how we update explore number ever change so as to prioritize what types of articles a user is annotating?

  user.exploreNumber = new_avg;
  user.numExplorations = user.numExplorations + 1;
  return user.save();
};
