import User from '../models/user';
import Annotation from '../models/annotation';

// TODO: addFollowing (add a user to the list of user's i am following)

const NOTIFICATION_TYPES = ['reply', 'adminDelete'];

export const addUserGroups = (userId, groupIds) => {
  return User.findByIdAndUpdate(userId, { $addToSet: { groups: { $each: groupIds } } }, { new: true });
};

export const addUserGroup = (userId, groupId) => {
  return addUserGroups(userId, [groupId]);
};

export const getUserAnnotations = (userId) => {
  return Annotation.find({ author: userId, parent: null }).sort({ createDate: -1 });
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

export const updateUserInfo = (userId, value) => {
  Object.keys(value).forEach((key) => {
    if (key !== 'bio' && key !== 'email' && key !== 'name') {
      delete value[key];
    }
  });
  return User.findByIdAndUpdate(userId, value, { new: true });
};

// Notifications are always prepended to the array, so the newest ones appear first.
export const addUserNotification = (userId, type, sender, href) => {
  if (!NOTIFICATION_TYPES.includes(type)) {
    return Promise.reject(new Error('Unrecognized notification type'));
  }
  const notification = { messageType: type };
  if (sender) notification.sender = sender;
  if (href) notification.href = href;
  return User.findByIdAndUpdate(
    userId,
    { $push: { notifications: { $each: [notification], $position: 0 } } },
    { new: true, select: 'notifications' }
  );
};

export const setNotificationsRead = (userId, notificationIds) => {
  return User.findById(userId, 'notifications')
  .then((user) => {
    for (const id of notificationIds) {
      const notification = user.notifications.id(id);
      notification.isRead = true;
    }

    return user.save();
  });
};

/* limit: # of notifications to return
* page: # of sets of [limit] notifications to skip from start of array
* automatically marks retrieved notifications as read unless "noRead" is truthy.
*/
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
      const newIds = user.notifications.filter(x => !x.isRead).map(x => x._id);
      // explicitly don't catch this promise - let it run in the background. Maybe a bad idea...
      setNotificationsRead(userId, newIds);
    }

    return user.notifications;
  });
};

export const getNumUnreadNotifications = (userId) => {
  return User.findById(userId, 'notifications')
  .then((user) => {
    if (user) {
      return user.numUnreadNotifications;
    } else {
      throw new Error('User not found');
    }
  });
};
