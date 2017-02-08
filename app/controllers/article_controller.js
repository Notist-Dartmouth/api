import Article from '../models/article';
import * as Group from './group_controller';

const ObjectId = require('mongoose').Types.ObjectId;

export const createArticle = (uri, groupid) => {
  const article = new Article();
  article.uri = uri;
  article.groups.push(groupid);
  console.log(groupid);
  return article.save()
      .then(result => {
        Group.addGroupArticle(groupid, article._id);
      });
};

export const getAllArticles = () => {
  return Article.find({});
};

export const getArticle = (id) => {
  return Article.find({ _id: ObjectId(id) });
};
