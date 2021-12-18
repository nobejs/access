module.exports = (permissions, checks) => {
  return new Promise((resolve, reject) => {
    try {
      let keys = Object.keys(permissions);

      console.log("keys", keys, checks)

      for (let check of checks) {
        if (keys.includes(check)) {
          return resolve({});
        }
      }

      return reject({
        statusCode: 403,
        message: "Forbidden"
      });
    } catch (error) {
      reject(error);
    }
  });
};
