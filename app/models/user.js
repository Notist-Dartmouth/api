import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  googleId: {type: String, ref: 'User'},
  name: String,
  username: { type: String, required: true, unique: true },
  email: String,
});

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
