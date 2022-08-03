# Registration Stories

| Story                        | Endpoint                  |
| ---------------------------- | ------------------------- |
| Users/UpdateAttribute        | /update-attribute         |
| Users/RequestVerifyAttribute | /request-verify-attribute |
| Users/VerifyAttribute        | /verify-attribute         |

## Introduction

Your application might provide user to update their email or mobile, or add alternate email or mobile.

Flow of adding new attribute works the following way:

- Step 1: Call `/update-attribute` API (which will send)
- Step 2: Call `/verify-attribute` to add attribute to user
- Step 3 (Optional): Call `/request-verify-attribute` if you want the OTP again

Flow of update attribute works the following way:

## Users/UpdateAttribute

This story allows user to add/update attributes.

`POST /update-attribute`

Sample Request Object:

```
{
    "type": "mobile_number",
    "value": "+918897587657"
}
```

### Parameters

**type** required

It can be "email" or "mobile_number"

**value** required

If type is email, it's email address. If type is mobile_number, it's any mobile number (any string).

value is not validated, but value should be unique

**purpose** optional

Any string, this string will differentiate among multiples emails/mobile_numbers.

## Users/VerifyAttribute

Verify user attribute update with OTP

`POST /verify-attribute`

Sample Request Payload

```
{
    "type": "mobile_number",
    "value": "+918897587657",
    "token": "735862"
}
```

### Parameters

**type** required

It can be "email" or "mobile_number"

**value** required

If type is email, it's email address. If type is mobile_number, it's any mobile number (any string).

**token** required

The OTP delivered to email or mobile of user.

**purpose** optional

Any string, this string will differentiate among multiples emails/mobile_numbers.

## Users/RequestVerifyAttribute

Request for OTP again so that user can verify

`POST /request-verify-attribute`

Sample Request Object:

```
{
    "type": "mobile_number",
    "value": "+918897587657"
}
```

### Parameters

**type** required

It can be "email" or "mobile_number"

**value** required

If type is email, it's email address. If type is mobile_number, it's any mobile number (any string).

value is not validated, but value should be unique

**purpose** optional

Any string, this string will differentiate among multiples emails/mobile_numbers.
