import Group from '../models/group';

const ObjectId = require('mongoose').Types.ObjectId;

export const createGroup = (name, description, creator) => {
  // TODO: error check on names, descriptions and creators?
  const group = new Group();
  group.name = name;
  group.description = description;
  group.creator = creator; // TODO: @ploomis how to get authenticated user ??
  group.createDate = Date.now();
  group.editDate = Date.now();
  group.members.push(ObjectId(creator));   // TODO: make sure creator is a valid user ID

  return group.save(); // TODO: catch errors
};

export const addGroupMember = (groupid, memberid) => {
// TODO: similar to addGroupArticle
  Group.findOne({ _id: ObjectId(groupid) }, (err, group) => {
    group.members.push(memberid); // TODO: validate member is a real member
    return group.save();
  });
};

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
};
