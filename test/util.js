// app.settings.env = 'test';
process.env.NODE_ENV = 'test';

import Group from '../server/models/group';
import User from '../server/models/user';
import Article from '../server/models/article';
import Annotation from '../server/models/annotation';

/* Wait a period of time, and then resolve as controlled by delayedCallback.
 * dbUpdateWait: (50) number of milliseconds to allow for the db to update
 */
exports.checkDatabase = function (delayedCallback, dbUpdateWait = 50) {
  return new Promise((resolve, reject) => {
    if (typeof delayedCallback !== 'function') {
      reject(new TypeError('Invalid callback to checkDatabase'));
    } else {
      // let callback function resolve the promise after waiting
      setTimeout(() => { delayedCallback(resolve); }, dbUpdateWait);
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

  return Promise.all(groups.map((group) => { return group.save(); }))
  .then((savedGroups) => {
    user.groups = savedGroups.map((group) => {
      return {
        _id: group._id,
        name: group.name,
        isPersonal: group.isPersonal,
      };
    });
    return user.save()
    .then((savedUser) => {
      return { user: savedUser, groups: savedGroups };
    });
  });
};

exports.addUserWithGroup = function (username = 'user', groupName = 'Group') {
  return exports.addUserWithNGroups(1, username, groupName).then((res) => {
    return { user: res.user, group: res.groups[0] };
  });
};

exports.addUser = function (username = 'user') {
  return exports.addUserWithNGroups(0, username).then((res) => {
    return res.user;
  });
};

exports.addArticleInGroups = function (groupIds, uri = 'www.testuri.com') {
  const article = new Article({
    uri,
    groups: groupIds,
    info: {
      title: `Article at ${uri}`,
      author: 'Fake Author',
      date_published: Date.now(),
      url: uri,
      lead_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Article_icon_cropped.svg/2000px-Article_icon_cropped.svg.png',
      dek: 'An article we\'re using to test Notist',
      excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam porta arcu in metus interdum, ut eleifend lorem luctus.',
      total_pages: 1,
      rendered_pages: 1,
      next_page_url: null,
      direction: 'ltr',
      word_count: 200,
    },
  });
  return article.save().then((savedArticle) => {
    return savedArticle;
  });
};

exports.addArticleInGroup = function (groupId, uri = 'www.testuri.com') {
  if (groupId) { return exports.addArticleInGroups([groupId], uri); } else { return exports.addArticleInGroups([], uri); }
};

exports.addArticle = function (uri = 'www.testuri.com') {
  return exports.addArticleInGroups([], uri);
};

exports.addArticleAnnotation = function (articleId, groupId, author, text = 'This is a test', isPublic = true) {
  let groups = [];
  if (groupId) {
    groups = [groupId];
  }
  const annotation = new Annotation({
    article: articleId,
    groups,
    author,
    articleText: 'Article makes an interesting point.',
    text,
    isPublic,
  });
  return annotation.save();
};
