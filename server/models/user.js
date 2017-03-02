import mongoose, { Schema } from 'mongoose';
mongoose.Promise = global.Promise;
import mongodb from 'mongodb';

const userSchema = new Schema({
  // TODO: Some of these need to be required fields
  // TODO: articles, people i'm following field
  googleId: String,
  facebookId: String,
  name: String,
  username: { type: String, unique: true },
  email: String,
  groupIds: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
});

userSchema.methods.isMemberOf = function isMemberOf(groupIdIn) {
  let groupId = groupIdIn;
  if (typeof groupId !== 'object') {
    groupId = new mongodb.ObjectId(groupIdIn);
  }
  return this.groupIds.some(someId => {
    return someId.equals(groupId);
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
