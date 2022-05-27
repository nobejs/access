# Registration Stories

| Story                      | Endpoint                     |
| -------------------------- | ---------------------------- |
| Users/RequestResetPassword | POST /request-reset-password |
| Users/ResetPassword        | POST /reset-password         |
| Users/UpdatePassword       | POST /update-password        |

## Introduction

These stories enable user to change password, it's possible two ways:

Logged in user:

- Step 1: Call `POST /update-password`

Not logged in user:

- Step 1: Call `POST /request-reset-password`
- Step 2: Call `POST /reset-password` with token and new password

## Users/RequestResetPassword

This story allows user to register via email or mobile.

`POST /request-reset-password`

Sample Request Object:

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

value is not validated, but value should be unique

## Users/ResetPassword

This story allows user to register via email or mobile.

`POST /reset-password`

Sample Request Object:

```
{
    "type": "email",
    "value": "rajiv@betalectic.com",
    "password": "Kissmiss10!",
    "token": "424553"
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

**token** required

The OTP delivered to email or mobile of user.

## Users/UpdatePassword

If user is logged in, they can update password without token or previous password

`POST /update-password`

Sample Request Object:

```
{
    "password": "Kissmiss10!"
}
```

### Parameters

**password** required

Any string, there is no strongness check
