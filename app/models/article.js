import mongoose, { Schema } from 'mongoose';

const ArticleSchema = new Schema({
  uri: String,
  annotations: [{ annotation_id: { type: Schema.Types.ObjectId, ref: 'Annotation' }, group_id: { type: Schema.Types.ObjectId, ref: 'Group' } }],
  group_id: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
});

const ArticleModel = mongoose.model('Article', ArticleSchema);
export default ArticleModel;
