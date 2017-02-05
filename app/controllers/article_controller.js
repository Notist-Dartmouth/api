import Article from '../models/article';
import * as Group from './group_controller';

export const createArticle = (req, res) => {
  const article = new Article();
  const groupid = req.body.group;
  article.uri = req.body.uri;
  article.groups.push(groupid);
  article.save()
      .then(result => {
        Group.addGroupArticle(groupid, article._id);
        res.json({ message: 'Article created' });
      })
      .catch(error => {
        res.json({ error });
      });
};

export const getArticles = (cb) => {
  Article.find({}, (err, articles) => {
    if (err) cb(err);
    cb(null, articles);
  });
};
