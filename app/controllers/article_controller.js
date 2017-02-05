import Article from '../models/Article';

export const createArticle = (req, res) => {
  const article = new Article();
  article.uri = req.body.uri;
  article.group_id = req.body.group;
  article.save()
      .then(result => {
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
