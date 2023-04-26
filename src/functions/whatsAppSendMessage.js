var axios = require("axios");
module.exports = async (payload) => {
  var data = JSON.stringify({
    messaging_product: "whatsapp",
    to: payload.mobile,
    // enable template if
    // type: "template",
    // template: {
    //   name: "redirect_with_token",
    //   language: {
    //     code: "en",
    //   },
    //   components: [
    //     {
    //       type: "header",
    //       parameters: [{ type: "text", text: process.env.WHATSAPP_APP_NAME }],
    //     },
    //     {
    //       type: "body",
    //       parameters: [{ type: "text", text: process.env.WHATSAPP_APP_NAME }],
    //     },
    //     {
    //       type: "button",
    //       sub_type: "url",
    //       index: "0",
    //       parameters: [
    //         {
    //           type: "text",
    //           text: payload.token,
    //         },
    //       ],
    //     },
    //   ],
    // },
    type: "text",
    preview_url: true,
    text: {
      body: `Please click the link to login: ${process.env.WHATSAPP_REDIRECT_URL}?access_token=${payload.token}`,
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
