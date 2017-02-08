import mongoose, { Schema } from 'mongoose';

const ObjectId = Schema.Types.ObjectId;

const annotationSchema = new Schema({
  authorId: { type: ObjectId, ref: 'User' },
  articleId: { type: ObjectId, ref: 'Article' },
  groupIds: [{ type: ObjectId, ref: 'Group' }],
  ancestors: [{ type: ObjectId, ref: 'Annotation' }],
  isPublic: { type: Boolean, default: true },

  text: { type: String, trim: true },
  articleText: String,

  createDate: { type: Date, default: Date.now },
  editDate: { type: Date, default: Date.now },
});

const AnnotationModel = mongoose.model('Annotation', annotationSchema);

export default AnnotationModel;
