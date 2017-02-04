import mongoose, { Schema } from 'mongoose';

const ArticleSchema = new Schema({
	uri: String,
	annotations: [{ annotation_id: Schema.Types.ObjectId, group_id: Schema.Types.ObjectId }],
	group_id: [Schema.Types.ObjectId]
});

const ArticleModel = mongose.model('Article', ArticleSchema);
export default ArticleModel;
