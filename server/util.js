import serializeError from 'serialize-error';

exports.returnPostSuccess = function returnPostSuccess(res, result) {
  res.json({ SUCCESS: result });
  return res;
};

exports.returnGetSuccess = function returnGetSuccess(res, result) {
  res.json(result);
  return res;
};

exports.returnError = function returnError(res, err) {
  res.json({ ERROR: serializeError(err) });
  return res;
};
