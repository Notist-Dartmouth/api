import User from '../models/user';

// TODO: addFollowing (add a user to the list of user's i am following)

export const addUserGroups = (userId, groupIds) => {
  return User.findByIdAndUpdate(userId, { $addToSet: { groups: { $each: groupIds } } }, { new: true });
};

export const addUserGroup = (userId, groupId) => {
  return addUserGroups(userId, [groupId]);
};

export const removeUserGroup = (userId, groupId) => {
  return User.findByIdAndUpdate(userId, { $pull: { groups: groupId } }, { new: true });
};

export const postUserExploreNumber = (userId, exploreNum, stdDev) => {
  return User.findByIdAndUpdate(userId, { exploreNumber: exploreNum, exploreStandardDev: stdDev, numExplorations: 20 }, { new: true });
};

export const updateUserExploreNumber = (userId, value) => {
  return User.findById(userId)
  .then((user) => {
    const oldAvg = user.exploreNumber;
    const newAvg = ((oldAvg * user.numExplorations) + value) / (user.numExplorations + 1);
    user.exploreNumber = newAvg;
    user.numExplorations = user.numExplorations + 1;
    return user.save();
  });
};

// Notifications are always prepended to the array, so the newest ones appear first.
export const addUserNotification = (userId, type, sender, href) => {
  const notification = { type };
  if (sender) notification.sender = sender;
  if (href) notification.href = href;
  return User.findByIdAndUpdate(userId, { $push: { notifications: { $each: [notification], $position: 0 } } }, { new: true });
};

const setNotificationsRead = (userId, notificationIds) => {
  return User.findById(userId)
  .then((user) => {
    for (const id of notificationIds) {
      const notification = user.notifications.id(id);
      notification.isNew = false;
    }

    return user.save();
  });
};

// limit: # of notifications to return
// page: # of sets of [limit] notifications to skip from start of array
// automatically marks retrieved notifications as read unless "noRead" is truthy.
export const getUserNotifications = (userId, limit, page, noRead) => {
  page = page || 0;
  let skip = 0;
  let projection;
  if (typeof limit === 'number') {
    skip = page * limit;
    projection = { notifications: { $slice: [skip, limit] } };
  } else {
    projection = { notifications: 1 };
  }

  return User.findById(userId, projection)
  .then((user) => {
    // mark unread notifications as read
    if (!noRead) {
      const readIds = user.notifications.filter(x => x.isNew).map(x => x._id);
      // explicitly don't catch this promise - let it run in the background. Maybe a bad idea...
      setNotificationsRead(userId, readIds);
    }

    return user.notifications;
  });
};
