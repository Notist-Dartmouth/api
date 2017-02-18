import Group from '../models/group';

export const createGroup = (name, description, userId) => {
  const group = new Group();
  group.name = name;
  group.description = description;
  group.creator = userId; // how to get authenticated user ??

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

};
