import mongoose, { Schema } from 'mongoose';
 // maybe need to import article/user models

const ObjectId = Schema.Types.Objectid;

const groupSchema = new Schema({
	name: String,
	description: { type: String, trim: true, default: '' },
	creator: { type: ObjectId, ref: 'User' },
	createDate: { type: Date, default: Date.now },
	editDate: { type: Date, default: Date.now },

	articleIds: [{ type: ObjectId, ref: 'Article' }],
	members: [{ type: ObjectId, ref: 'User' }],

	// optional
	joinableBy: ??, // most impt to figure out
	readableBy: ??, // less impt
	writableBy: ??  // less impt
});

const groupModel = mongoose.model('Group', groupSchema);

export default groupModel;
