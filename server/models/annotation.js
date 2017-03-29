import mongoose, { Schema } from 'mongoose';
mongoose.Promise = global.Promise;

const ObjectId = Schema.Types.ObjectId;

// sub-schema for "ranges" entries
const rangeSchema = new Schema({
  start: String,
  end: String,
  startOffset: Number,
  endOffset: Number,
}, { _id: false });

const annotationSchema = new Schema({
  author: { type: ObjectId, ref: 'User' },
  username: String,
  article: { type: ObjectId, ref: 'Article' },

  parent: { type: ObjectId, ref: 'Annotation' },
  childAnnotations: [{ type: ObjectId, ref: 'Annotation' }],
  isTopLevel: { type: Boolean, default: false },

  groups: [{ type: ObjectId, ref: 'Group' }],
  isPublic: { type: Boolean, default: true },

  text: { type: String, trim: true },
  articleText: String,
  ranges: [rangeSchema],
  // TODO: implement system for locating article text robustly
  points: { type: Number, default: 0 },

  createDate: { type: Date, default: Date.now },
  editDate: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
});

// Enforce that private annotations have exactly one group.
annotationSchema.pre('save', function preSave(next) {
  if (!this.isPublic && this.groups.length > 1) {
    const err = new Error('Cannot assign private annotation to multiple groups');
    next(err);
  } else {
    next();
  }
});

annotationSchema.methods.isTopLevel = function isTopLevel() {
  return this.parent === undefined; // TODO: make sure this works
};

// TODO: we could maybe use virtual columns to deal with object id stuff?
// annotationSchema.virtual('id').get(function () {
//   return this._id.toString();
// });
//
// annotationSchema.virtual('articleId')
//   .get(function () { return this.article_id.toString(); })
//   .set(function (articleId) { this.article_id = new ObjectId(articleId); });
//
//
// annotationSchema.virtual('authorId').get(function () {
//   return this.author_id.toString();
// });

const AnnotationModel = mongoose.model('Annotation', annotationSchema);

export default AnnotationModel;
