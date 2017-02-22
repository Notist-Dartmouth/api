import mongoose, { Schema } from 'mongoose';

const ObjectId = Schema.Types.ObjectId;

const GroupSchema = new Schema({
  name: String,
  description: { type: String, trim: true, default: '' },
  creator: { type: ObjectId, ref: 'User' },
  createDate: { type: Date, default: Date.now },
  editDate: { type: Date, default: Date.now },
  articles: [{ type: ObjectId, ref: 'Article' }],
  members: [{ type: ObjectId, ref: 'User' }],

// for now, all groups are private.
// isPublic: Boolean,
});

const GroupModel = mongoose.model('Group', GroupSchema);

export default GroupModel;
