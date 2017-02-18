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
  isPublic: Boolean,

  createDate: { type: Date, default: Date.now },
  editDate: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
});

// Enforce that private annotations have exactly one group.
annotationSchema.pre('save', function preSave(next) {
  if (!this.isPublic && this.groupIds.length === 0) {
    const err = new Error('Must assign private annotation to a group');
    next(err);
  } else if (!this.isPublic && this.groupIds.length > 1) {
    const err = new Error('Cannot assign private annotation to multiple groups');
    next(err);
  } else {
    next();
  }
});

const AnnotationModel = mongoose.model('Annotation', annotationSchema);

export default AnnotationModel;
