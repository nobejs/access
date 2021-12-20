module.exports = (jsDateTimeString, jsDateObject = new Date()) => {
  return new Date(jsDateTimeString) < jsDateObject;
};
