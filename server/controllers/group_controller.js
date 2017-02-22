import Group from '../models/group';

export const createGroup = (name, description, userId) => {
  const group = new Group();
  group.name = name;
  group.description = description;
  group.creator = userId; // how to get authenticated user ??

  group.createDate = Date.now();
  group.editDate = Date.now();
  group.members.push(userId);   // TODO: make sure creator is a valid user ID

  return group.save(); // TODO: catch errors
};

export const addGroupMember = (groupIds, userId) => {
// TODO: similar to addGroupArticle
  for (let i = 0; i < groupIds.length; i++) {
    const groupId = groupIds[i];
    Group.findByIdAndUpdate(groupId, { $push: { members: userId } });
  }
};

export const addGroupArticle = (groupIds, articleId) => {
  for (let i = 0; i < groupIds.length; i++) {
    const groupId = groupIds[i];
    Group.findByIdAndUpdate(groupId, { $push: { articles: articleId } });
  }
};

export const getGroup = (userId, groupId) => {
  // TODO: need to check if user is in the group OR the group is public
  return Group.find({ $and: [{ _id: userId }, { $or: [{ isPublic: true }, { members: { $in: userId } }] }] });
};
