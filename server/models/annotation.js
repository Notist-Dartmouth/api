import mongoose, { Schema } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

import * as Articles from '../controllers/article_controller';
import * as Groups from '../controllers/group_controller';
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

const annotationSchema = new Schema({
  author: { type: ObjectId, ref: 'User', autopopulate: { select: '-_id' } },
  article: { type: ObjectId, ref: 'Article' },
  parent: { type: ObjectId, ref: 'Annotation', default: null },
  childAnnotations: [{ type: ObjectId, ref: 'Annotation', autopopulate: true }],
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
  // if annotation is reply, update fields accordingly

  const fillReply = new Promise((resolve, reject) => {
    if (this.parent) {
      this.constructor.findByIdAndUpdate(this.parent, { $push: { childAnnotations: this._id } })
      .then((parent) => {
        this.article = parent.article;
        this.articleText = parent.articleText;
        this.ranges = parent.ranges;
        this.isPublic = parent.isPublic;
        this.groups = parent.groups;
        resolve(true);
      });
    } else {
      resolve(true);
    }
  });

  fillReply.then(() => {
    if (!this.author.isMemberOfAll(this.groups)) {
      throw new Error('User not authorized to add annotation to one or more groups');
    }

    if (!this.isPublic && this.groups.length > 1) {
      throw new Error('Cannot assign private annotation to multiple groups');
    }

    next();
  })
  .catch((err) => {
    next(err);
  });
});

annotationSchema.post('save', (annotation, next) => {
  // Save annotation to article
  Articles.addArticleAnnotation(annotation.article, annotation._id).exec();

  // Save article to group
  if (annotation.parent == null) {
    Articles.addArticleGroups(annotation.article, annotation.groups).exec();
    Groups.addGroupArticle(annotation.article, annotation.groups);
  }

  next();
});

annotationSchema.pre('remove', function preRemove(next, user, callback) {
  if (!this.deleted && user._id.toString() !== this.author.toString()) {
    next(new Error('User cannot remove annotation'));
  }

  // Remove annotation from article
  Article.findByIdAndUpdate(this.article, { $pull: { annotations: this._id } }).then((article) => {
    next(callback); // if no more annotations then should probably do something?
  });
});

annotationSchema.virtual('isTopLevel').get(function getIsTopLevel() {
  return this.parent === null;
});

annotationSchema.virtual('numChildren').get(function getNumChildren() {
  return this.childAnnotations.length;
});

annotationSchema.plugin(autopopulate);

const AnnotationModel = mongoose.model('Annotation', annotationSchema);

export default AnnotationModel;
