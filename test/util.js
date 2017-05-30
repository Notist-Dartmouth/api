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

exports.addNUsersWithNGroups = function (nUsers, nGroups, name = 'User', groupName = 'Group', isAdmin = false) {
  if (typeof nUsers !== 'number' || typeof nGroups !== 'number' || nGroups < 0
    || typeof name !== 'string' || typeof groupName !== 'string') {
    throw new TypeError('Invalid argument(s)');
  }

  const users = [];
  for (let i = 0; i < nUsers; i++) {
    const currName = nUsers === 1 ? name : `${name}${i + 1}`;
    users[i] = new User({
      googleId: `${currName}_id`,
      name,
      email: `${currName}@testuri.com`,
      bio: `Hi, my name is ${currName}.`,
      photoSrc: `somewebsite.com/${currName}.png`,
      isAdmin,
    });
  }

  const groups = [];
  for (let i = 0; i < nGroups; i++) {
    const currGroupName = nGroups === 1 ? groupName : `${groupName} ${i + 1}`;
    groups[i] = new Group({
      name: `${currGroupName}`,
      description: `Description of ${currGroupName}`,
      creator: users[0]._id,
      members: users.map((user) => user._id),
    });
  }

  return Promise.all(groups.map((group) => group.save()))
  .then((savedGroups) => {
    for (const user of users) {
      user.groups = savedGroups.map((group) => group._id);
    }
    return Promise.all(users.map((user) => user.save()))
    .then((savedUsers) => {
      return { users: savedUsers, groups: savedGroups };
    });
  });
};

exports.addUserWithNGroups = function (nGroups, name, groupName, isAdmin) {
  return exports.addNUsersWithNGroups(1, nGroups, name, groupName, isAdmin)
  .then((res) => ({ user: res.users[0], groups: res.groups }));
};

exports.addUserWithGroup = function (name, groupName) {
  return exports.addUserWithNGroups(1, name, groupName)
  .then((res) => ({ user: res.user, group: res.groups[0] }));
};

exports.addUser = function (name) {
  return exports.addUserWithNGroups(0, name).then((res) => res.user);
};

exports.addAdmin = function (name = 'Admin') {
  return exports.addUserWithNGroups(0, name, 'Group', true).then((res) => res.user);
};

exports.addNUsers = function (nUsers, name = 'User') {
  return exports.addNUsersWithNGroups(nUsers, 0, name).then((res) => res.users);
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

exports.addNArticles = function (nArticles, domain = 'testuri', tld = 'com') {
  const articles = [];
  for (let i = 0; i < nArticles; i++) {
    const newArticle = exports.addArticle(`${domain}${i}.${tld}`);
    articles.push(newArticle);
  }
  return Promise.all(articles);
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
