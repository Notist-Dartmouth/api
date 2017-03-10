import mongoose, { Schema } from 'mongoose';
mongoose.Promise = global.Promise;
import normalizeUrl from 'normalize-url';

const normalizeURI = (uri) => {
  const options = {
    stripWWW: true,
    normalizeHttps: true,
    removeDirectoryIndex: true,
  };
  return normalizeUrl(uri, options);
};

const articleSchema = new Schema({
  uri: {
    type: String,
    trim: true,
    set: normalizeURI,
    unique: true,
    required: true,
  },
  title: { type: String, trim: true, required: true },
  annotations: [{ type: Schema.Types.ObjectId, ref: 'Annotation' }],
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],

  isMisleading: { type: Boolean, default: false },
  isSatire: { type: Boolean, default: false },
});

articleSchema.statics.normalizeURI = normalizeURI;

articleSchema.statics.urisAreEqual = (uri1, uri2) => {
  return normalizeURI(uri1) === normalizeURI(uri2);
};

// TODO: add pre-save hook to check whether articles are satire or misleading
// (probably by checking the hostname using url-parse)

const ArticleModel = mongoose.model('Article', articleSchema);
export default ArticleModel;
