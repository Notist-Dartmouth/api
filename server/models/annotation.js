import mongoose, { Schema } from 'mongoose';

import Article from './article';
mongoose.Promise = global.Promise;

const ObjectId = Schema.Types.ObjectId;

// sub-schema for "ranges" entries
const rangeSchema = new Schema({
  start: String,
  end: String,
  startOffset: Number,
  endOffset: Number,
}, { _id: false });

// TODO: change names of fields to not have "Id" in them
const annotationSchema = new Schema({
  author: { type: ObjectId, ref: 'User' },
  username: String,
  article: { type: ObjectId, ref: 'Article' },
  parent: { type: ObjectId, ref: 'Annotation', default: null },
  // numChildren counts annotations marked as deleted, but not removed annotatins.
  numChildren: { type: Number, default: 0 },
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

annotationSchema.pre('remove', function (next, user) {
  if (user._id.toString() != this.author.toString()) {
    next(new Error('User cannot remove annotation'));
  }

  // Remove annotation from article
  Article.findByIdAndUpdate(this.article, { $pull: { annotations: this._id } }).then((article) => {
    next(); // if no more annotations then should probably do something?
  });
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
