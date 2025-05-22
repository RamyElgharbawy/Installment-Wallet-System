// @desc  remove passwordConfirm field from body before saving in db
exports.sanitizeUserInputs = (req, res, next) => {
  // destructuring body to isolate confirm password filed
  const { passwordConfirm, ...userData } = req.body;
  // inject user data into req
  req.sanitizedData = userData;
  next();
};

// @desc
exports.adjItemData = (req, res, next) => {
  let itemData = {};

  itemData.type = req.body.type;
  itemData.title = req.body.title;
  itemData.price = req.body.price;
  itemData.purchaseDate = new Date(req.body.purchaseDate);
  itemData.numberOfMonths = req.body.numberOfMonths;
  itemData.startIn = new Date(req.body.startIn);
  itemData.endIn = new Date(req.body.endIn);
  itemData.notes = req.body.notes ? req.body.notes : null;
  itemData.owner = req.body.userId;

  // inject item data to req
  req.itemData = itemData;
  next();
};
