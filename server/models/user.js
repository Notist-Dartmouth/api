import mongoose, { Schema } from 'mongoose';
mongoose.Promise = global.Promise;
import mongodb from 'mongodb';

import Annotation from './annotation';

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

userSchema.virtual('articles').get(function getUserArticles() {
  // get annotations
  return Annotation.distinct('article', { author: this });
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

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
