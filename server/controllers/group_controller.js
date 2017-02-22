import Group from '../models/group';

export const createGroup = (name, description, userId) => {
  const group = new Group();
  group.name = name;
  group.description = description;
  group.creator = userId;

  group.createDate = Date.now();
  group.editDate = Date.now();
  group.members.push(userId);

  return group.save();
};

// TODO: this is unnecessary, not the same as below
export const addGroupMember = (groupIds, userId) => {
  for (let i = 0; i < groupIds.length; i++) {
    const groupId = groupIds[i];
    Group.findByIdAndUpdate(groupId, { $push: { members: userId } });
  }
};

export const addArticleToGroups = (articleId, groupIds) => {
  const updates = groupIds.map(groupId => {
    return Group.findByIdAndUpdate(groupId, { $push: { articles: articleId } });
  });
  return Promise.all(updates);
};

export const getGroup = (userId, groupId) => {
// TODO: util to check for the second part isPublic/user is member?
  return Group.find({ $and: [{ _id: groupId }, { $or: [{ isPublic: true }, { members: { $in: userId } }] }] });
};
