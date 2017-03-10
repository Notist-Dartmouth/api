import mongoose, { Schema } from 'mongoose';
mongoose.Promise = global.Promise;

const ObjectId = Schema.Types.ObjectId;

// TODO: change names of fields to not have "Id" in them
const annotationSchema = new Schema({
  authorId: { type: ObjectId, ref: 'User' },
  articleId: { type: ObjectId, ref: 'Article' },
  parent: { type: ObjectId, ref: 'Annotation' },

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
