import Group from '../models/group';

<<<<<<< HEAD
export const createGroup = (name, description, userId) => {
  const group = new Group();
  group.name = name;
  group.description = description;
  group.creator = userId; // how to get authenticated user ??
=======
const ObjectId = require('mongoose').Types.ObjectId;

export const createGroup = (name, description, creator) => {
  // TODO: error check on names, descriptions and creators?
  const group = new Group();
  group.name = name;
  group.description = description;
  group.creator = creator; // TODO: @ploomis how to get authenticated user ??
>>>>>>> 7796b3ae497ce24605e2dc481b597c6a2f12efff
  group.createDate = Date.now();
  group.editDate = Date.now();
  group.members.push(ObjectId(creator));   // TODO: make sure creator is a valid user ID

<<<<<<< HEAD
  return group.save();
=======
  return group.save(); // TODO: catch errors
>>>>>>> 7796b3ae497ce24605e2dc481b597c6a2f12efff
};

export const addGroupMember = (groupid, memberid) => {
// TODO: similar to addGroupArticle
  Group.findOne({ _id: ObjectId(groupid) }, (err, group) => {
    group.members.push(memberid); // TODO: validate member is a real member
    return group.save();
  });
};

<<<<<<< HEAD
// can this just be called on an array of groupids? yes
export const addGroupArticle = (groupIds, articleId) => {

  // Group.findOne({ _id: groupid }, (err, group) => {
  //   if (err) return;
  //   group.articles.push(articleid);
  //   group.save()
  //     .then(result => {
  //       return group;
  //     })
  //     .catch(error => {
  //       return error;
  //     });
  // });
};

export const getGroup = (userId, groupId) => {
  // need to check if user is in the group OR the group is public
  return Group.findOne({ _id: groupId });
    // .populate('articles');
=======
export const addGroupArticle = (groupid, articleid) => {
  Group.findOne({ _id: ObjectId(groupid) }, (err, group) => {
    // if (err) return; TODO: figure out how to actually catch errors
    group.articles.push(articleid);
    return group.save();
  });
};

export const getGroup = (id) => {
  return Group.findOne({ _id: ObjectId(id) })
              .populate('articles');
>>>>>>> 7796b3ae497ce24605e2dc481b597c6a2f12efff
};
