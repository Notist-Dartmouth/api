import Group from '../models/group';

/*
Create a new group.
Input:
  name: String name of the group
  description: String description of the groupIds
  creator: String user ID
Output: Returns json file with the updated group.
*/
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

/*
Add a member to a specific group
Input:
  groupId: String group ID
  userId: String user ID
Output: Returns json file with the updated group.
*/
export const addGroupMember = (groupId, userId) => {
  return Group.findByIdAndUpdate(groupId, { $push: { members: userId } });
};

/*
Add an article to multiple groups
Input:
  groupIds: Array of String group IDs
  articleId: String article ID
Output: ??
*/
export const addGroupArticle = (groupIds, articleId) => {
// TODO: how the hell to do bulk update?
// TODO: look at Promise.all() as a way to do this
  for (let i = 0; i < groupIds.length; i++) {
    const groupId = groupIds[i];
    Group.findByIdAndUpdate(groupId, { $push: { articles: articleId } });
  }
};

/*
Get the document of a particular group, assuming access is already allowed.
Input:
  groupId: String of group ID
Output: Returns json file of the group.
*/
export const getGroup = (groupId) => {
  return Group.find({ _id: groupId });
};
