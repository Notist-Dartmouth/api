import Group from '../models/group';

const ObjectId = require('mongoose').Types.ObjectId;

export const createGroup = (req, res) => {
  const group = new Group();
  group.name = req.body.name;
  group.description = req.body.description;
  group.creator = req.body.creator; // how to get authenticated user ??
  group.createDate = Date.now();
  group.editDate = Date.now();

  // group.members = req.body.creator;

  group.save()
      .then(result => {
        res.json({ message: 'Group created' });
      })
      .catch(error => {
        res.json({ error });
      });
};

export const addGroupMember = (groupid, memberid) => {
// TO DO: similar to addGroupArticle
// Group.findOne({ _id: ObjectId(groupid) });
};

export const addGroupArticle = (groupid, articleid) => {
  Group.findOne({ _id: ObjectId(groupid) }, (err, group) => {
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

export const getGroup = (id, cb) => {
  Group
    .findOne({ _id: ObjectId(id) })
    .populate('articles')
    .exec(function (err, group) {
      if (err) return cb(err);
      return cb(null, group);
    });
};
