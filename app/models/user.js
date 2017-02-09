import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  googleId: String,
  facebookId: String,
  name: String,
  username: { type: String, unique: true },
  email: String,
  groupIds: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
