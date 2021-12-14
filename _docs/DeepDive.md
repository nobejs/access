## JWT Token Properties

We are going to generate JWT Tokens to be used as API Tokens, API Tokens atleast at this point would be generated for mainly two purposes:

1. User Authentication
2. User API Tokens (For API Access)
3. Team API Tokens (For API Access)

Does it really matter to differentiate between 1 & 2. Both are API Tokens issued by user using different methods - The access is severely restricted with these tokens, as products might be using Team API Tokens mostly. If at all there is a product which operates at individual level, then "2" might matter.

But let's begin to explore how do we even differentiate them.

"Tokens" table has to recognize a token by it's "jti" claim. Basically, that would mean we are whitelisting tokens. If a token is not found when searched by jti, or found to be expired. It means it's not valid.

We will following claims:

- jti
- exp
- sub - user_uuid/team_uuid
- issuer - user/team

Why we need issuer?

1. An app is accessing few apis where it needs to check if it has enough permissions to do so
2. A user is accessing few apis (postman or ui/react) 


### API calls in two contexts:

1. Team
2. User

- API call can be made in context of a team
   - Authorization: Bearer <issuer:user> - sub has user_uuid
   - X-Team-Token: <team_uuid>
    or
   - Authorization: Bearer <issuer:team> - sub has team_uuid

* issuer:user and api call is in user context
* issuer:user and api call is in team context
   - We need to verify if user is part of team
   - Build the permissions array for that user in that team
* issuer:team and api call is made in team context
   - Build the permissions array for that token in that team
