import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  googleId: String,
  facebookId: String,
  name: String,
  email: String,
});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
