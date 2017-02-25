import mongoose, { Schema } from 'mongoose';
mongoose.Promise = global.Promise;

const ObjectId = Schema.Types.ObjectId;

// TODO: change names of fields to not have "Id" in them
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
  edited: { type: Boolean, default: false },
});

// Enforce that private annotations have exactly one group.
annotationSchema.pre('save', function preSave(next) {
  if (!this.isPublic && this.groupIds.length > 1) {
    const err = new Error('Cannot assign private annotation to multiple groups');
    next(err);
  } else {
    next();
  }
});

const AnnotationModel = mongoose.model('Annotation', annotationSchema);

export default AnnotationModel;
