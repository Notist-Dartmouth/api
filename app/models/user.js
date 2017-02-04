import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  googleId: String,
  facebookId: String,
  name: String,
  email: String,
});

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
