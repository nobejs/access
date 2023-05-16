var axios = require("axios");
module.exports = async (payload) => {
  let payloadData = {
    messaging_product: "whatsapp",
    ...payload,
  };

  var data = JSON.stringify(payloadData);

  var config = {
    method: "post",
    url: `https://graph.facebook.com/v13.0/${process.env.WHATSAPP_NUMBER_ID}/messages`,
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error.response.data);
    });
};
