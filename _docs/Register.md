# Registration Stories

| Story                              | Endpoint                     |
| ---------------------------------- | ---------------------------- |
| Users/CanRegister                  | /register                    |
| Users/RequestVerifyForRegistration | /request-verify-registration |
| Users/VerifyRegistration           | /verify-registration         |

## Introduction

Your application might provide user to Register via email or mobile. Flow of registration works the following way:

- Step 1: Call `/register` API
- Step 2: Call `/verify-registration` API
- Step 3 (Optional): Call `/request-verify-registration` if you want the OTP again

## Users/CanRegister

This story allows user to register via email or mobile.

`POST /register`

Sample Request Object:

```
{
    "type": "email",
    "value": "rajiv@betalectic.com",
    "password": "SecurePassword!"
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

## Users/VerifyRegistration

Verify user registration with OTP

`POST /verify-registration`

Sample Request Payload

```
{
    "type": "email",
    "value": "rajiv+1@betalectic.com",
    "token": "553475"
}
```

### Parameters

**type** required

It can be "email" or "mobile"

**value** required

If type is email, it's email address. If type is mobile, it's any mobile number (any string).

**token** required

The OTP delivered to email or mobile of user.

## Users/RequestVerifyForRegistration

Request for OTP again so that user can verify

`POST /request-verify-registration`

Sample Request Payload:

```
{
    "type": "email",
    "value": "rajiv@betalectic.com"
}
```

### Parameters

**type** required

It can be "email" or "mobile"

**value** required

If type is email, it's email address. If type is mobile, it's any mobile number (any string).
