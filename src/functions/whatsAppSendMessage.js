var axios = require("axios");
module.exports = async (payload) => {
  var data = JSON.stringify({
    messaging_product: "whatsapp",
    to: payload.mobile,
    type: "template",
    template: {
      name: "redirect_with_token",
      language: {
        code: "en",
      },
      components: [
        {
          type: "header",
          parameters: [{ type: "text", text: process.env.WHATSAPP_APP_NAME }],
        },
        {
          type: "body",
          parameters: [{ type: "text", text: process.env.WHATSAPP_APP_NAME }],
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [
            {
              type: "text",
              text: payload.token,
            },
          ],
        },
      ],
    },
  });

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
