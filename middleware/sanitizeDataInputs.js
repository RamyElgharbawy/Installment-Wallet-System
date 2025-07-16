// @desc  remove passwordConfirm field from body before saving in db
exports.sanitizeUserInputs = (req, res, next) => {
  // destructuring body to isolate confirm password filed
  const { passwordConfirm, ...userData } = req.body;
  // inject user data into req
  req.sanitizedData = userData;
  next();
};

// @desc  set userId to body from logged user data
exports.setUserIdToBody = (req, res, next) => {
  if (!req.body.userId) {
    req.body.userId = req.user.id;
  }
  next();
};

// @desc  set userId to Params from logged user data
exports.setUserIdToParams = (req, res, next) => {
  if (!req.params.userId) {
    req.params.userId = req.user.id;
  }
  next();
};
