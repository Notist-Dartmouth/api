import Group from '../models/group';

export const createGroup = (name, description, userId) => {
  const group = new Group();
  group.name = name;
  group.description = description;
  group.creator = userId; // how to get authenticated user ??
  group.createDate = Date.now();
  group.editDate = Date.now();

  return group.save();
};

export const addGroupMember = (groupid, memberid) => {
// TO DO: similar to addGroupArticle
// Group.findOne({ _id: ObjectId(groupid) });
};

export const addGroupArticle = (groupid, articleid) => {
  Group.findOne({ _id: groupid }, (err, group) => {
    if (err) return;
    group.articles.push(articleid);
    group.save()
      .then(result => {
        return group;
      })
      .catch(error => {
        return error;
      });
  });
};

export const getGroup = (userId, groupId) => {
  // need to check if user is in the group OR the group is public
  return Group.findOne({ _id: groupId });
    // .populate('articles');
};
