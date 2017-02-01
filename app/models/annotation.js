import mongoose, { Schema } from 'mongoose';

const ObjectId = Schema.Types.ObjectId;

const annotationSchema = new Schema({
  authorId: ObjectId,
  articleId: ObjectId,
  groupIds: [ObjectId],
  // ancestors = [parent.ancestors parent._id] if has parent, else []
  ancestors: [ObjectId],
  
  text: { type: String, trim: true },
  articleText: String,
  
  createDate: { type: Date, default: Date.now },
  editDate: { type: Date, default: Date.now}
});

const AnnotationModel = mongoose.model('Annotation', annotationSchema);

export default AnnotationModel;
