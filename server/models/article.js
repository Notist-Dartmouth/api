import mongoose, { Schema } from 'mongoose';

// TODO: Add field to keep track of number of users who have commented, number of comments

const ArticleSchema = new Schema({
  uri: String,
  annotations: [{ annotation_id: { type: Schema.Types.ObjectId, ref: 'Annotation' }, group_id: { type: Schema.Types.ObjectId, ref: 'Group' } }],
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
});

const ArticleModel = mongoose.model('Article', ArticleSchema);
export default ArticleModel;
