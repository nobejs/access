module.exports = (minutes = 10) => {
  const value = new Date(new Date().getTime() + minutes * 60000).toISOString();
  return value;
};
