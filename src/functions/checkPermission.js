module.exports = (permissions, checks) => {
  return new Promise((resolve, reject) => {
    try {
      let keys = Object.keys(permissions);

      for (let check in checks) {
        if (keys.includes(check)) {
          return resolve({});
        }
      }

      return reject({});
    } catch (error) {
      reject(error);
    }
  });
};
