import mongoose, { Schema } from 'mongoose';
mongoose.Promise = global.Promise;
import mongodb from 'mongodb';

const userSchema = new Schema({
  // TODO: articles field
  googleId: String,
  facebookId: String,
  name: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  groups: [{ _id: { type: Schema.Types.ObjectId, ref: 'Group' },
             name: String,
             isPersonal: Boolean }],
  usersIFollow: [{ _id: { type: Schema.Types.ObjectId, ref: 'User' },
                   username: String }],
  usersFollowingMe: [{ _id: { type: Schema.Types.ObjectId, ref: 'User' },
                      username: String }],
});

userSchema.methods.isMemberOf = function isMemberOf(groupIdIn) {
  let groupId = groupIdIn;
  if (typeof groupId !== 'object') {
    groupId = new mongodb.ObjectId(groupIdIn);
  }
  return this.groups.some(someGroup => {
    return someGroup._id.equals(groupId);
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
