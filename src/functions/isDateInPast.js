module.exports = (jsDateTimeString, jsDateObject = Date.now()) => {
  return new Date(jsDateTimeString) < jsDateObject;
};
