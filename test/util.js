import Group from '../server/models/group';
import User from '../server/models/user';
import Article from '../server/models/article';

// number of milliseconds to allow for the db to update
const DB_UPDATE_WAIT = 50;

exports.checkDatabase = function (delayedCallback) {
  return new Promise((resolve, reject) => {
    if (typeof delayedCallback !== 'function') {
      reject(new TypeError('Invalid callback to checkDatabase'));
    } else {
      setTimeout(() => { delayedCallback(resolve); }, DB_UPDATE_WAIT);
    }
  });
};

exports.addUserWithNGroups = function (nGroups, username = 'user', groupName = 'Group') {
  if (typeof nGroups !== 'number' || nGroups < 0 || typeof username !== 'string' || typeof groupName !== 'string') {
    throw new TypeError('Invalid argument(s)');
  }

  const user = new User({
    googleId: `test_${username}`,
    name: `Test User '${username}'`,
    username,
    email: `${username}@testuri.com`,
  });

  const groups = [];
  for (let i = 0; i < nGroups; i++) {
    groups[i] = new Group({
      name: `${groupName} ${i}`,
      description: `Description of ${groupName} ${i}`,
      creator: user._id,
      members: [user._id],
    });
  }
  user.groupIds = groups.map(group => { return group._id; });
  user.save(err => { if (err) throw err; });
  groups.map(group => { group.save(err => { if (err) throw err; }); return 0; });

  return { user, groups };
};

exports.addUserWithGroup = function (username = 'user', groupName = 'Group') {
  const res = exports.addUserWithNGroups(1, username, groupName);
  return { user: res.user, group: res.groups[0] };
};

exports.addUser = function (username = 'user') {
  return exports.addUserWithNGroups(0, username).user;
};

exports.addArticleInGroups = function (groupIds, uri = 'www.testuri.com') {
  const article = new Article({
    uri,
    groups: groupIds,
  });
  article.save(err => { if (err) throw err; });
  return article;
};

exports.addArticleInGroup = function (groupId, uri = 'www.testuri.com') {
  return exports.addArticleInGroups([groupId], uri);
};
