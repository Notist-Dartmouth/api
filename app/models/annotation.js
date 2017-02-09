import mongoose, { Schema } from 'mongoose';

const ObjectId = Schema.Types.ObjectId;

const annotationSchema = new Schema({
  authorId: { type: ObjectId, ref: 'User' },
  articleId: { type: ObjectId, ref: 'Article' },
  // ancestors = [parent.ancestors parent._id] if has parent, else []
  ancestors: [{ type: ObjectId, ref: 'Annotation' }],

  text: { type: String, trim: true },
  articleText: String,

  groupIds: [{ type: ObjectId, ref: 'Group' }],
  isPublic: { type: Boolean, default: true },

  createDate: { type: Date, default: Date.now },
  editDate: { type: Date, default: Date.now },
});

const AnnotationModel = mongoose.model('Annotation', annotationSchema);

export default AnnotationModel;
