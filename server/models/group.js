import mongoose, { Schema } from 'mongoose';
mongoose.Promise = global.Promise;

const ObjectId = Schema.Types.ObjectId;

const GroupSchema = new Schema({
  name: { type: String, trim: true },
  description: { type: String, trim: true, default: '' },
  creator: { type: ObjectId, ref: 'User' },
  members: [{ type: ObjectId, ref: 'User' }],
  articles: [{ type: ObjectId, ref: 'Article' }],

  createDate: { type: Date, default: Date.now },
  editDate: { type: Date, default: Date.now },

  isPublic: { type: Boolean, default: false }, // irrelevant for personal groups
  isPersonal: { type: Boolean, default: false },
});

const GroupModel = mongoose.model('Group', GroupSchema);

export default GroupModel;
