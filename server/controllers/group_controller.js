import Group from '../models/group';

/*
Create a new group.
Input:
  name: String name of the group
  description: String description of the groupIds
  creator: String user ID
Output: Returns json file with the updated group.
*/
export const createGroup = (name, description, userId, isPersonal, isPublic) => {
  const group = new Group();
  group.name = name;
  group.description = description;
  group.creator = userId;
  group.createDate = Date.now();
  group.editDate = Date.now();
  group.members.push(userId);
  group.isPublic = isPublic;
  group.isPersonal = isPersonal;

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
  return Group.findByIdAndUpdate(groupId, { $addToSet: { members: userId } }, { new: true });
};
/*
Add an article to multiple groups
Input:
  groupIds: Array of String group IDs
  articleId: String article ID
Output: Returns a promise that resolves with array of results of updating groups.
*/
export const addGroupArticle = (articleId, groupIds) => {
  const updates = groupIds.map((groupId) => {
    return Group.findByIdAndUpdate(groupId, { $addToSet: { articles: articleId } });
  });
  return Promise.all(updates);
};

/*
Get the document of a particular group, assuming access is already allowed.
Input:
  groupId: String of group ID
Output: Returns json file of the group.
*/
// TODO: Clarify the point of this endpoint, should it get all the articles or
// annotations, or be like a history/info about the group?
export const getGroup = (groupId) => {
  return Group.findById(groupId);
};

/*
Get a list of groups, filtered by some conditions.
Input:
  query: A mongodb query selector object
Output: Resolves to a list of matching groups
Example:
  Groups.getGroupsFiltered({
    members: user._id,
    isPersonal: false,
    articles: { $all: [article1ID, article2ID] },
  });
*/
export const getGroupsFiltered = (query) => {
  if (typeof query !== 'object') {
    return Promise.reject(new Error('Invalid group query'));
  }
  return Group.find(query);
};

/*
Get the members of a group, assuming access is already allowed.
Input:
  groupId: String of group ID
Output: Rejects if groupId is not found;
otherwise resolves to array of user objects that are members of the group.
*/
export const getGroupMembers = (groupId) => {
  return Group.findById(groupId)
  .populate('members')
  .select('members')
  .exec()
  .then((group) => {
    if (group === null) {
      // reject since this shouldn't be an expected situation, if we have a groupId
      throw new Error('Group not found');
    } else {
      return group.members;
    }
  });
};

/*
Get the articles of a group, assuming access is already allowed.
Input:
  groupId: String of group ID
Output: Rejects if groupId is not found;
otherwise resolves to array of article objects that are in the group.
*/
// TODO: we don't actually have a router function for this quite yet
export const getGroupArticles = (groupId, pagination_options) => {
  return Group.findById(groupId)
  .populate({ path: 'articles', options: pagination_options }) // THIS IS WHERE PAGINATION WOULD HAPPEN
  .select('articles')
  .exec()
  .then((group) => {
    if (group === null) {
      // reject since this shouldn't be an expected situation, if we have a groupId
      throw new Error('Group not found');
    } else {
      return group.articles;
    }
  });
};
