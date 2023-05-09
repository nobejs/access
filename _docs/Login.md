# Login Stories

| Story                            | Endpoint                 |
| -------------------------------- | ------------------------ |
| Users/CanLogin                   | POST /login              |
| Users/RedirectForLoginWithGoogle | POST /login/google       |
| Users/LoginWithGoogle            | GET /login/google?code=  |
| Users/LoginWithOTP               | POST /login/otp          |
| Users/InitiateLoginWithOTP       | POST /login/otp/initiate |

## Introduction

To just login with email or mobile:

- Step 1: Call `POST /login`
- Step 2: Store the authorization token

To login with Google:

- Step 1: Call `POST /login/google` API
- Step 2: You will get a url in response, redirect user to that url
- Step 3: After user has authorized, Google will redirected user back to "redirect url" you have configured
- Step 4: Take the code from url sent by Google and then call `GET /login/google?code=`
- Step 5: Store the authorization token

To login with OTP:

- Step 1: Call `/login/otp/initiate`
- Step 2: Call `/login/otp`

## Users/CanLogin

This story allows user to login via email or mobile.

`POST /login`

Sample Request Object:

```
{
    "type": "email",
    "value": "rajiv@betalectic.com",
    "password": "SecurePassword!"
}
```

Sample Response:

```
{
    "access_token": "eyJhbGciOiJFZERTQSJ9.eyJleHAiOjE2ODM5Nzc5OTksInN1YiI6ImQzOGQ5ZmQ1LTM1YzMtNDc0Zi1iN2RjLTZlYmJlZjIwZDI0OSIsImlzcyI6InVzZXIiLCJqdGkiOiI4Y2NmZGNlNi04NjEzLTQwZTUtYmRhNC0zMjEyMGRiZTcyNTcifQ.W6ihp1saO84OGVGnmIEmyZ3tJqs9URWI-Ljrb3msyStxHwuMyXJFIGyf5WOtH1xalQd-jgo2fgYhD5HnWE6SBw"
}
```

### Parameters

**type** required

It can be "email" or "mobile_number"

**value** required

If type is email, it's email address. If type is mobile_number, it's any mobile number (any string).

value is not validated, but value should be unique

**password** required

Any string, there is no strongness check

## Users/RedirectForLoginWithGoogle

This API responds with the url to which user should be redirected to, so that they can authenticate with Google.

`POST /login/google`

The flow usually

Sample Request Payload

To directly get the access token, This is default, so you needn't pass it.

```
{
    "state" : "respond_with_token"
}
```

To get the token along with redirection to an url

```
{
    "state" : "redirect_with_token"
}
```

### Parameters

There are no parameters

## Users/LoginWithGoogle

Login with Google

`GET /login/google?code=`

### Parameters

**code** required

Code given by Google to login.

The response of this api depends on "state" passed in RedirectForLoginWithGoogle story.

State: respond_with_token

You will directly get an access token as part of json response

State: redirect_with_token

You will be redirected to the URL you mentioned in `REDIRECT_WITH_TOKEN_ENDPOINT` environment variable. It would redirect to:

Ex 1: If `REDIRECT_WITH_TOKEN_ENDPOINT=https://teurons.com`

The final redirection would be to: `https://teurons.com?access_token=<access_token>`

Ex 1: If `REDIRECT_WITH_TOKEN_ENDPOINT=teurons://login_screen`

The final redirection would be to: `teurons://login_screen?access_token=<access_token>`

## Users/InitiateLoginWithOTP

This story allows user request OTP to login via OTP

`POST /login/otp/initiate`

Sample Request Object:

```
{
    "type": "email",
    "value": "rajiv+1@betalectic.com"
}
```

### Parameters

**type** required

It can be "email" or "mobile_number"

**value** required

If type is email, it's email address. If type is mobile_number, it's any mobile number (any string).

value is not validated, but value should be unique

## Users/LoginWithOTP

This story allows user request OTP to login via OTP

`POST /login/otp`

Sample Request Object:

```
{
    "type": "mobile",
    "value": "+918897587656",
    "token": "166542"
}
```

### Parameters

**type** required

It can be "email" or "mobile_number"

**value** required

If type is email, it's email address. If type is mobile_number, it's any mobile number (any string).

value is not validated, but value should be unique

**token** required

The OTP delivered to email or mobile of user.

### Setup static OTP for User

If user need to be logged in with a static otp, we can set it by env variable in env file.

**Add the below key to env file**

TEST_USER_ACCOUNTS=ffa9f868-bf21-47e9-8cb5-5055655a95a7
TEST_USER_PASSWORD=123456

The key `TEST_USER_ACCOUNTS` accepts the uuid of users for which we want to set the static OTP, You can add multiple uuids as it accepts comma separated values

The key `TEST_USER_PASSWORD` used for setting the static OTP

## Whatsapp login

| Story                              | Endpoint                        |
| ---------------------------------- | ------------------------------- |
| Users/RedirectForLoginWithWhatsApp | GET /login/whatsapp             |
| Users/WhatsAppWebhook              | GET /login/whatsapp-login       |
| Users/LoginWithWhatsApp            | POST /login/whatsapp-login      |
| Users/WhatsappRedirection          | GET /login/whatsapp-redirection |

### To login with whatsapp:

- Prerequisits: We have to verify this endpoint `GET /login/whatsapp-login` in whatsapp with the `WHATSAPP_ENDPOINT_VERIFICATION_CODE`(this variable is added in the env)
- Step 1: Call `GET /login/whatsapp` API
- Step 2: You will get a url in response, redirect user to that url
- Step 3: You will be redirected to the whatsapp, click on send
- Step 4: User will be authorized (`POST /login/whatsapp-login`)
- Step 4: You will recieve a link in the whatsapp (`GET /login/whatsapp-redirection`), on clicking the url user will redirect to app
- Step 5: Till here you are able to login with whatsapp, Now if you want to send the interactive message(redirection link message) to users, You have to create a template in whatsapp business platform

### ENV Variable:

- `WHATSAPP_NUMBER_ID`: This the id of the phone number, it can be obtained from the whatsapp business platform
- `WHATSAPP_PHONE_NUMBER`: WhatsApp mobile number added in the whatsapp business platform
- `WHATSAPP_TOKEN`: This the token can be obtained from the whatsapp business platform
- `WHATSAPP_ENDPOINT_VERIFICATION_CODE`: This value can be anything, But this value
- `WHATSAPP_REDIRECT_URL`: full url of endpoint with `/login/whatsapp-redirection`
- `WHATSAPP_TEMPLATE`: Default value is `false`, After you have created template in whatsapp business platform and template is approved make this value `true`,
- `WHATSAPP_APP_NAME`: App name is needed for the template.

### WhatsApp Messages:

- text message: If you dont have template this the message goes to user

```
    type: "text",
    text: {
        preview_url: true,
        body: `Click the link to continue: ${process.env.WHATSAPP_REDIRECT_URL}?code=${payload.token}&state=redirect_with_token`,
    },
```

- Template message: If you have template this the message goes to the user

```
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
```

### WhatsApp Template

- Go to whatsapp business platform: `https://business.facebook.com/wa/manage/message-templates/`
- Create a template:
  - Template name should be: `redirect_with_token`
  - Template language should be english
  - Template should have CTA where link should be `${process.env.WHATSAPP_REDIRECT_URL}?state=redirect_with_token&code={{1}}`
- Example template: ![WhatsApp Template Example](_docs/WhatsApp_template_example.png "WhatsApp Template Example")
