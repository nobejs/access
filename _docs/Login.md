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

- Step 1: Call `/login/google` API
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

It can be "email" or "mobile"

**value** required

If type is email, it's email address. If type is mobile, it's any mobile number (any string).

value is not validated, but value should be unique

**password** required

Any string, there is no strongness check

## Users/RedirectForLoginWithGoogle

Verify user registration with OTP

`POST /login/google`

Sample Request Payload

### Parameters

There are no parameters

## Users/LoginWithGoogle

Login with Google

`GET /login/google?code=`

### Parameters

**code** required

Code given by Google to login.

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

It can be "email" or "mobile"

**value** required

If type is email, it's email address. If type is mobile, it's any mobile number (any string).

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

It can be "email" or "mobile"

**value** required

If type is email, it's email address. If type is mobile, it's any mobile number (any string).

value is not validated, but value should be unique

**token** required

The OTP delivered to email or mobile of user.
