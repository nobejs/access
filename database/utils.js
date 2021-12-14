const postEvent = requireFunction("postEvent");

const getMinutesFromNow = (minutes = 10) => {
  return new Date(new Date().getTime() + minutes * 60000).toISOString();
};

module.exports = {
  getMinutesFromNow,
};
