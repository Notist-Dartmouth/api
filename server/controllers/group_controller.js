import Group from '../models/group';

// TODO: getGroupsFiltered (get groups filtered by some thing, returned ordered)
// TODO: getGroupUsers (get users of a group)
// TODO: getGroupArticles (get articles of a given group)

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
  return Group.findByIdAndUpdate(groupId, { $push: { members: userId } }, { new: true });
};

/*
Add an article to multiple groups
Input:
  groupIds: Array of String group IDs
  articleId: String article ID
Output: Returns a promise that resolves with array of results of updating groups.
*/
export const addGroupArticle = (articleId, groupIds) => {
  const updates = groupIds.map(groupId => {
    return Group.findByIdAndUpdate(groupId, { $push: { articles: articleId } });
  });
  return Promise.all(updates);
};

/*
Get the document of a particular group, assuming access is already allowed.
Input:
  groupId: String of group ID
Output: Returns json file of the group.
*/
export const getGroup = (groupId) => {
  return Group.findOne({ _id: groupId });
};
