const findKeysFromRequest = requireUtil("findKeysFromRequest");
const usersRepo = requireRepo("users");
const sendMessage = require("../../../functions/whatsAppSendMessage");
const attributesRepo = requireRepo("attributes");
const decryptData = requireFunction("Encryption/decryptData");

const prepare = ({ reqQuery, reqBody, reqParams, req, res }) => {
  const payload = findKeysFromRequest(req, ["object", "entry"]);
  return payload;
};

const authorize = async ({ prepareResult }) => {
  try {
    if (0) {
      throw {
        statusCode: 401,
        message: "Unauthorized",
      };
    }

    return true;
  } catch (error) {
    throw error;
  }
};

const handle = async ({ prepareResult, authorizeResult, res }) => {
  try {
    if (prepareResult.object) {
      if (
        prepareResult.entry &&
        prepareResult.entry[0].changes &&
        prepareResult.entry[0].changes[0] &&
        prepareResult.entry[0].changes[0].value.messages &&
        prepareResult.entry[0].changes[0].value.messages[0]
      ) {
        let contacts = prepareResult.entry[0].changes[0].value.contacts;
        let msg_body = prepareResult.entry[0].changes[0].value.messages[0].text
          ? prepareResult.entry[0].changes[0].value.messages[0].text.body
            ? prepareResult.entry[0].changes[0].value.messages[0].text.body
            : ""
          : "";

        const escapedStartingString = "Link mobile for user: ".replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );
        const escapedEndingString =
          " (This is encrypted for security purposes)".replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );

        const pattern = new RegExp(
          `^${escapedStartingString}.*${escapedEndingString}$`
        );

        console.log("check:", pattern.test(msg_body));

        if (msg_body === "Login with WhatsApp") {
          // const phone_number_id =
          //   prepareResult.entry[0].changes[0].value.metadata.phone_number_id;
          const from = prepareResult.entry[0].changes[0].value.messages[0].from;
          console.log("loginWithWhatsApp_prepareResult__from===>: ", from);
          const userContact = contacts.filter((item) => item.wa_id === from);
          const user_name = userContact[0].profile.name;

          let userObject = {};
          if (user_name) {
            userObject["name"] = user_name;
          }
          if (from) {
            userObject["mobile"] = `+${from}`;
          }

          let token = await usersRepo.registerUserFromWhatsApp(userObject);
          // create payload for send message:
          let payload;
          if (process.env.WHATSAPP_TEMPLATE === "true") {
            payload = {
              to: from,
              type: "template",
              template: {
                name: process.env.WHATSAPP_LOGIN_LINK_TEMPLATE_NAME,
                language: {
                  code: "en",
                },
                components: [
                  {
                    type: "header",
                    parameters: [
                      { type: "text", text: process.env.WHATSAPP_APP_NAME },
                    ],
                  },
                  {
                    type: "body",
                    parameters: [
                      { type: "text", text: process.env.WHATSAPP_APP_NAME },
                    ],
                  },
                  {
                    type: "button",
                    sub_type: "url",
                    index: "0",
                    parameters: [
                      {
                        type: "text",
                        text: token,
                      },
                    ],
                  },
                ],
              },
            };
          } else {
            payload = {
              to: from,
              type: "text",
              text: {
                preview_url: true,
                body: `Click the link to continue: ${process.env.WHATSAPP_REDIRECT_URL}?code=${token}&purpose=login`,
              },
            };
          }

          await sendMessage(payload);
        } else if (pattern.test(msg_body)) {
          const encryptedData = msg_body.split(" ")[4];
          const from = prepareResult.entry[0].changes[0].value.messages[0].from;
          // decrypt data and get the user uuid
          let decodedData = await decryptData(encryptedData);

          const user_uuid = decodedData;

          const existingAttribute = await attributesRepo.first({
            type: "mobile_number",
            value: `+${from}`,
          });
          // check if mobile number is already registered to some other account
          if (existingAttribute) {
            console.log("existingAttribute:1:>");
            if (existingAttribute.user_uuid === user_uuid) {
              // updated attribute
              let updatedAttribute = await attributesRepo.update(
                {
                  uuid: existingAttribute.uuid,
                },
                {
                  type: "mobile_number",
                  value: `+${from}`,
                }
              );

              let payload = {
                to: from,
                type: "text",
                text: {
                  preview_url: true,
                  body: `Your mobile number is added successfuly. Click the link to continue: ${process.env.WHATSAPP_REDIRECT_URL}?purpose=verify&status=mobile_number_added`,
                },
              };

              await sendMessage(payload);
            } else {
              // mobile number is already registered with other account
              let payload = {
                to: from,
                type: "text",
                text: {
                  preview_url: true,
                  body: `Your mobile number is already added with other account. Click the link to go back to app: ${process.env.WHATSAPP_REDIRECT_URL}?purpose=verify&status=mobile_number_already_exist`,
                },
              };

              await sendMessage(payload);
            }
          } else {
            console.log("existingAttribute_else:1:>");
            // check if user already have mobile number
            const existingAttributeForUser = await attributesRepo.first({
              user_uuid: user_uuid,
              type: "mobile_number",
            });
            console.log("existingAttribute", existingAttribute);
            if (existingAttributeForUser) {
              let updatedAttribute = await attributesRepo.update(
                {
                  uuid: existingAttributeForUser.uuid,
                },
                {
                  type: "mobile_number",
                  value: `+${from}`,
                }
              );
            } else {
              let createAttribute = await attributesRepo.createAttributeForUUID(
                user_uuid,
                { type: "mobile_number", value: `+${from}` },
                true
              );
            }
            //mobile number is added for the user_uuid, send message to user that number linked successfully
            let payload = {
              to: from,
              type: "text",
              text: {
                preview_url: true,
                body: `Your mobile number is added successfuly. Click the link to continue: ${process.env.WHATSAPP_REDIRECT_URL}?purpose=verify&status=mobile_number_added`,
              },
            };

            await sendMessage(payload);
          }
        }
      }
      res.code(200);
    } else {
      res.code(404);
    }
  } catch (error) {
    throw error;
  }
};

const respond = async ({ prepareResult, handleResult }) => {
  try {
    return handleResult;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  prepare,
  authorize,
  handle,
  respond,
};
