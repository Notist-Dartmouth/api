
exports.returnPostSuccess = function (res, result) {
  res.json({ SUCCESS: result });
  return res;
};

exports.returnGetSuccess = function (res, result) {
  res.json({ result });
  return res;
};

exports.returnError = function (res, err) {
  res.json({ ERROR: serializeError(err) });
  return res;
};
