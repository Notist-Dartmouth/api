import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  googleId: {type: String, ref: 'User'},
  name: String,
  email: String,
});

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
