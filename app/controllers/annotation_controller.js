import Annotation from '../models/annotation';

export const createAnnotation = (req, res) => {
  const user = req.user;
  const annotation = new Annotation();
  annotation.authorId = user._id;
  annotation.articleId = req.body.articleId;
  annotation.text = req.body.text;
  annotation.articleText = req.body.articleText;
  if (req.body.parentId) {
    Annotation.findById(req.body.parentId)
      .then(parent => {
        // inherit properties from parent
        annotation.groupIds = parent.groupIds;
        annotation.ancestors = parent.ancestors.concat([parent._id]);
        saveAnnotation(annotation, res);
      })
      .catch(err => {
        res.json({ error });
      });
  } else {
    annotation.groupIds = req.body.groupIds;
    annotation.ancestors = [];
    saveAnnotation(annotation, res);
  }
};

const saveAnnotation = (annotation, res) => {
  annotation.save()
    .then(result => {
      const aid = annotation._id.valueOf();
      res.json({ message: 'Annotation ' + aid + ' created!' });
    })
    .catch(err => {
      res.json({ err });
    });
}
