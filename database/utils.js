const getMinutesFromNow = (minutes = 10) => {
  return new Date(new Date().getTime() + minutes * 60000).toISOString();
};

const generateOTP = (length = 6) => {
  return Math.floor(100000 + Math.random() * 900000);
};

module.exports = {
  getMinutesFromNow,
  generateOTP,
};
