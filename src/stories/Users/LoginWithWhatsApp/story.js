const findKeysFromRequest = requireUtil("findKeysFromRequest");
const usersRepo = requireRepo("users");
const sendMessage = require("../../../functions/whatsAppSendMessage");

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
        let msg_body =
          prepareResult.entry[0].changes[0].value.messages[0].text.body;

        if (msg_body === "Login with WhatsApp") {
          // const phone_number_id =
          //   prepareResult.entry[0].changes[0].value.metadata.phone_number_id;
          const from = prepareResult.entry[0].changes[0].value.messages[0].from;
          console.log('loginWithWhatsApp_prepareResult__from===>: ', from);
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
          await sendMessage({ mobile: from, token: token });
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
