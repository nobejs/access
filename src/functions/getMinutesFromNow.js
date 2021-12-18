module.exports = (minutes = 10) => {
    return new Date(new Date().getTime() + minutes * 60000).toISOString();
};