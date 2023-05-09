var axios = require("axios");
module.exports = async (payload) => {
  let payloadData = {};

  if (process.env.WHATSAPP_TEMPLATE === "true") {
    payloadData = {
      messaging_product: "whatsapp",
      to: payload.mobile,
      type: "template",
      template: {
        name: process.env.WHATSAPP_TEMPLATE_NAME,
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
    };
  } else {
    payloadData = {
      messaging_product: "whatsapp",
      to: payload.mobile,
      type: "text",
      text: {
        preview_url: true,
        body: `Click the link to continue: ${process.env.WHATSAPP_REDIRECT_URL}?code=${payload.token}&state=redirect_with_token`,
      },
    };
  }

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
