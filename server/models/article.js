import mongoose, { Schema } from 'mongoose';
mongoose.Promise = global.Promise;
import url from 'url';
import normalizeUrl from 'normalize-url';
import fetch from 'node-fetch';

const IMPT_QUERY_PARAMS = {
  global: ['id'],
  'youtube.com': ['v'],
};

const normalizeURI = (uri) => {
  const options = {
    stripWWW: true,
    normalizeHttps: true,
    removeDirectoryIndex: true,
    removeQueryParameters: [],
  };
  const intermediateURI = normalizeUrl(uri, options);
  const uriObj = url.parse(intermediateURI, true);
  delete uriObj.search;
  const keepParams = IMPT_QUERY_PARAMS[uriObj.hostname] || [];
  keepParams.push(...IMPT_QUERY_PARAMS.global);
  for (const param of Object.keys(uriObj.query)) {
    if (!keepParams.includes(param)) {
      delete uriObj.query[param];
    }
  }
  // pass through normalizeUrl again to strip trailing slashes
  return normalizeUrl(url.format(uriObj));
};

// Fields returned by Mercury
const mercurySchema = new Schema({
  title: String,
  content: { type: String, select: false },
  author: String,
  date_published: { type: Date, default: Date.now },
  lead_image_url: String,
  dek: String,
  next_page_url: String,
  url: String,
  domain: String,
  excerpt: String,
  word_count: Number,
  direction: String,
  total_pages: Number,
  rendered_pages: Number,
}, { _id: false });

const articleSchema = new Schema({
  uri: {
    type: String,
    trim: true,
    set: normalizeURI,
    unique: true,
    required: true,
  },

  avgUserScore: { type: Number, default: 0 },
  numShares: { type: Number, default: 0 },
  info: mercurySchema,
  annotations: [{ type: Schema.Types.ObjectId, ref: 'Annotation' }],
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
});

articleSchema.statics.normalizeURI = normalizeURI;

articleSchema.statics.urisAreEqual = (uri1, uri2) => {
  return normalizeURI(uri1) === normalizeURI(uri2);
};

articleSchema.methods.fetchMercuryInfo = function fetchMercuryInfo() {
  const encodedURI = encodeURIComponent(this.uri);
  return fetch(`https://mercury.postlight.com/parser?url=${encodedURI}`,
  { headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.MERCURY_API_KEY } })
  .then((res) => {
    return res.json();
  }).then((json) => {
    if ( // Mercury error conditions:
      !json ||
      (typeof json.message === 'object' && json.message === null) ||
      json.error
    ) {
      return {};
    } else {
      return json;
    }
  });
};

// Presave: fetch Mercury info
articleSchema.pre('save', function preSave(next) {
  if (!this.info) {
    this.fetchMercuryInfo()
    .then((info) => {
      this.info = info;
      next();
    })
    .catch((err) => {
      this.info = {};
      next(err);
    });
  } else {
    next();
  }
});

// TODO: add pre-save hook to check whether articles are satire or misleading
// (probably by checking the hostname using url-parse)
const ArticleModel = mongoose.model('Article', articleSchema);
export default ArticleModel;
