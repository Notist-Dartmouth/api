import mongoose, { Schema } from 'mongoose';

const ObjectId = Schema.Types.Objectid;

const groupSchema = new Schema({
	name: String,
	description: { type: String, trim: true, default: '' },
	creator: ObjectId,
	createDate: { type: Date, default: Date.now },
	editDate: {type: Date, default: Date.now },

	articleIds: [ObjectId],
	members: [ObjectId],

	// optional
	joinableBy: ??, // most impt to figure out
	readableBy: ??, // less impt
	writableBy: ??  // less impt
});

const groupModel = mongoose.model('Group', groupSchema);

export default groupModel;
