import mongoose, { Schema } from 'mongoose';
mongoose.Promise = global.Promise;
import mongodb from 'mongodb';

import Annotation from './annotation';
import Group from './group';

const userSchema = new Schema({
  googleId: String,
  facebookId: String,
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  usersIFollow: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  usersFollowingMe: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  exploreNumber: Number,
  numExplorations: Number,
  exploreStandardDev: Number,
});

userSchema.virtual('articles').get(() => {
  // get annotations
  return Annotation.distinct('article', { author: this }).then((articles) => {
    return articles;
  });
});

userSchema.virtual('annotations').get(function getUserAnnotations() {
  return Annotation.find({ author: this }).then((annotations) => {
    return annotations;
  });
});

userSchema.methods.isMemberOf = function isMemberOf(groupIdIn) {
  let groupId = groupIdIn;
  if (typeof groupId !== 'object') {
    groupId = new mongodb.ObjectId(groupIdIn);
  }
  return this.groups.some((someGroup) => {
    return someGroup.equals(groupId);
  });
};

userSchema.methods.isMemberOfAll = function isMemberOfAll(groupIds) {
  return groupIds.every(this.isMemberOf, this);
};

userSchema.methods.isMemberOfAny = function isMemberOfAny(groupIds) {
  return groupIds.some(this.isMemberOf, this);
};

userSchema.post('save', (user, next) => {
  // Save annotation to article
  user.addUserGroups(['59127637f0717e001cbfe583', // US Politics
                      '59127895f0717e001cbfe584', // Random
                      '59127908f0717e001cbfe585', // World News
                      '591279ecf0717e001cbfe586', // Opinion
                    ]).exec();

  Group.addGroupMember('59127637f0717e001cbfe583', user._id);
  Group.addGroupMember('59127895f0717e001cbfe584', user._id);
  Group.addGroupMember('59127908f0717e001cbfe585', user._id);
  Group.addGroupMember('591279ecf0717e001cbfe586', user._id);

  next();
});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
